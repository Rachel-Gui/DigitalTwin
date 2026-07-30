export const MIN_PARTICLES = 200;
export const MAX_PARTICLES = 2000;
export const PM_MAX = 50;
export const GRASSHOPPER_DT = 0.8;
export const CONCORD_PM_EXPONENT = 2;
export const CONCORD_GRAPH_SCALE = 20;

export type Vec3 = [number, number, number];
export type ParticleState = { position: Vec3; velocity: Vec3 };
export type RandomSource = () => number;

// PHI EarthDay.gh rounds each PM value, squares it, multiplies it by 20,
// then remaps the full 24-hour branch into its own particle-count domain.
export function concordPopulateCounts(
  pmSeries: readonly number[],
  particleRange: readonly [number, number],
) {
  if (pmSeries.length === 0) return [];
  const weighted = pmSeries.map((pm25) => Math.round(pm25) ** CONCORD_PM_EXPONENT * CONCORD_GRAPH_SCALE);
  const sourceMin = Math.min(...weighted);
  const sourceMax = Math.max(...weighted);
  const [targetMin, targetMax] = particleRange;
  if (sourceMin === sourceMax) return weighted.map(() => Math.round(targetMin));
  return weighted.map((value) => Math.round(
    targetMin + ((value - sourceMin) / (sourceMax - sourceMin)) * (targetMax - targetMin),
  ));
}

export function concordPopulateCountAt(
  pmSeries: readonly number[],
  particleRange: readonly [number, number],
  hour: number,
) {
  const counts = concordPopulateCounts(pmSeries, particleRange);
  if (counts.length === 0) return 0;
  return counts[((hour % counts.length) + counts.length) % counts.length];
}

export function targetParticleCount(pm25: number) {
  const normalized = Math.max(0, Math.min(pm25 / PM_MAX, 1));
  return Math.trunc(MIN_PARTICLES + normalized * (MAX_PARTICLES - MIN_PARTICLES));
}

export function particleRgb(pm25: number): [number, number, number] {
  const normalized = Math.max(0, Math.min(pm25 / PM_MAX, 1));
  return [
    (120 + normalized * 135) / 255,
    (200 - normalized * 80) / 255,
    (255 - normalized * 150) / 255,
  ];
}

export function windVectorXZ(windU: number, windV: number, directionDegrees: number): [number, number] {
  const magnitude = Math.hypot(windU, windV);
  if (magnitude > 1e-6) return [windU / magnitude, -windV / magnitude];
  const radians = directionDegrees * Math.PI / 180;
  return [-Math.sin(radians), Math.cos(radians)];
}

export function insideExtrudedPolygon(
  position: Vec3,
  polygonXZ: readonly (readonly [number, number])[],
  minY: number,
  maxY: number,
) {
  const [x, y, z] = position;
  if (y < minY || y > maxY || polygonXZ.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygonXZ.length - 1; i < polygonXZ.length; j = i++) {
    const [xi, zi] = polygonXZ[i];
    const [xj, zj] = polygonXZ[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function distanceToSegmentSquared(
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
) {
  const dx = bx - ax;
  const dz = bz - az;
  const denominator = dx * dx + dz * dz;
  const t = denominator === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / denominator));
  const offsetX = x - (ax + dx * t);
  const offsetZ = z - (az + dz * t);
  return offsetX * offsetX + offsetZ * offsetZ;
}

export function makeExtrudedPolygonBoundary(
  polygonsXZ: readonly (readonly (readonly [number, number])[])[],
  minY: number,
  maxY: number,
  toleranceM = 0,
) {
  const toleranceSquared = toleranceM * toleranceM;
  const entries = polygonsXZ
    .filter((polygon) => polygon.length >= 3)
    .map((polygon) => ({
      polygon,
      minX: Math.min(...polygon.map(([x]) => x)),
      maxX: Math.max(...polygon.map(([x]) => x)),
      minZ: Math.min(...polygon.map(([, z]) => z)),
      maxZ: Math.max(...polygon.map(([, z]) => z)),
    }));

  return (position: Vec3) => {
    const [x, y, z] = position;
    if (y < minY || y > maxY) return false;
    for (const entry of entries) {
      if (
        x < entry.minX - toleranceM || x > entry.maxX + toleranceM
        || z < entry.minZ - toleranceM || z > entry.maxZ + toleranceM
      ) continue;
      if (insideExtrudedPolygon(position, entry.polygon, minY, maxY)) return true;
      if (toleranceM <= 0) continue;
      for (let index = 0, previous = entry.polygon.length - 1; index < entry.polygon.length; previous = index, index += 1) {
        const [ax, az] = entry.polygon[previous];
        const [bx, bz] = entry.polygon[index];
        if (distanceToSegmentSquared(x, z, ax, az, bx, bz) <= toleranceSquared) return true;
      }
    }
    return false;
  };
}

export function initializeSouthParkParticle(
  seed: readonly [number, number, number],
  windDirectionXZ: readonly [number, number],
  windSpeed: number,
  windSpeedMultiplier: number,
  random: RandomSource,
): ParticleState {
  const scaledSpeed = Math.max(windSpeed, 0) * windSpeedMultiplier;
  return {
    position: [seed[0], seed[1] + 2 + random() * 18, seed[2]],
    velocity: [windDirectionXZ[0] * scaledSpeed * 5, 0, windDirectionXZ[1] * scaledSpeed * 5],
  };
}

export function stepSouthParkParticle(
  state: ParticleState,
  windDirectionXZ: readonly [number, number],
  windSpeed: number,
  windSpeedMultiplier: number,
  dt: number,
  random: RandomSource,
  insideBoundary: (position: Vec3) => boolean,
): ParticleState {
  const scaledSpeed = Math.max(windSpeed, 0) * windSpeedMultiplier;
  const force: Vec3 = [windDirectionXZ[0] * scaledSpeed * 3, 0, windDirectionXZ[1] * scaledSpeed * 3];
  const velocity: Vec3 = [
    state.velocity[0] * 0.8 + force[0] * 0.2 + random() * 0.15 - 0.075,
    state.velocity[1] * 0.8 + random() * 0.08 - 0.04,
    state.velocity[2] * 0.8 + force[2] * 0.2 + random() * 0.15 - 0.075,
  ];
  let position: Vec3 = [
    state.position[0] + velocity[0] * dt,
    state.position[1] + velocity[1] * dt,
    state.position[2] + velocity[2] * dt,
  ];
  if (!insideBoundary(position)) {
    velocity[0] *= -0.3;
    velocity[1] *= -0.3;
    velocity[2] *= -0.3;
    position = [
      state.position[0] + velocity[0] * dt,
      state.position[1] + velocity[1] * dt,
      state.position[2] + velocity[2] * dt,
    ];
    if (insideBoundary(state.position) && !insideBoundary(position)) position = [...state.position];
  }
  return { position, velocity };
}

export function stepSouthParkRoadParticle(
  state: ParticleState,
  windDirectionXZ: readonly [number, number],
  windSpeed: number,
  windSpeedMultiplier: number,
  dt: number,
  random: RandomSource,
  insideBoundary: (position: Vec3) => boolean,
): ParticleState {
  const unconstrained = stepSouthParkParticle(
    state,
    windDirectionXZ,
    windSpeed,
    windSpeedMultiplier,
    dt,
    random,
    () => true,
  );
  if (insideBoundary(unconstrained.position)) return unconstrained;

  const [vx, vy, vz] = unconstrained.velocity;
  const turnAngles = [
    Math.PI / 12, -Math.PI / 12,
    Math.PI / 6, -Math.PI / 6,
    Math.PI / 4, -Math.PI / 4,
    Math.PI / 3, -Math.PI / 3,
    Math.PI / 2, -Math.PI / 2,
    Math.PI * 2 / 3, -Math.PI * 2 / 3,
    Math.PI,
    0,
  ];
  for (const scale of [1, 0.5, 0.25, 0.1]) {
    for (const angle of turnAngles) {
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const velocity: Vec3 = [
        (vx * cosine - vz * sine) * scale,
        vy * scale,
        (vx * sine + vz * cosine) * scale,
      ];
      const position: Vec3 = [
        state.position[0] + velocity[0] * dt,
        state.position[1] + velocity[1] * dt,
        state.position[2] + velocity[2] * dt,
      ];
      if (insideBoundary(position)) return { position, velocity };
    }
  }

  return stepSouthParkParticle(
    state,
    windDirectionXZ,
    windSpeed,
    windSpeedMultiplier,
    dt,
    () => 0.5,
    insideBoundary,
  );
}

export function interpolatePosition(previous: Vec3, current: Vec3, alpha: number): Vec3 {
  const t = Math.max(0, Math.min(alpha, 1));
  return [
    previous[0] + (current[0] - previous[0]) * t,
    previous[1] + (current[1] - previous[1]) * t,
    previous[2] + (current[2] - previous[2]) * t,
  ];
}

export function deterministicBoxPopulation(
  min: readonly [number, number, number],
  max: readonly [number, number, number],
  count: number,
  seed: number,
) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: count }, (): Vec3 => [
    min[0] + (max[0] - min[0]) * random(),
    min[1] + (max[1] - min[1]) * random(),
    min[2] + (max[2] - min[2]) * random(),
  ]);
}
