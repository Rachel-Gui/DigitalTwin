"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

type XrGlobalState = typeof globalThis & {
  __phiActiveImmersiveSession?: XRSession | null;
};

const xrGlobal = globalThis as XrGlobalState;
import type { AirRecord, ConcordPopulateConfig, NarrationStatus, SceneConfig, SouthParkWindConfig } from "../lib/types";
import {
  MAX_PARTICLES,
  concordPopulateCounts,
  deterministicBoxPopulation,
  initializeSouthParkParticle,
  interpolatePosition,
  makeExtrudedPolygonBoundary,
  particleRgb,
  stepSouthParkRoadParticle,
  targetParticleCount,
  windVectorXZ,
  type ParticleState,
  type Vec3,
} from "../lib/particleModel";

type Props = {
  record: AirRecord | null;
  hour: number;
  narrationStatus: NarrationStatus;
  simulationSeed: number;
  vrButtonHostId: string;
  onVrSupport: (supported: boolean) => void;
  sceneConfig: SceneConfig;
  onSceneStatus: (status: string) => void;
};

type ReplacementInstance = {
  category: "tree" | "conifer" | "shrub" | "hedge" | "vehicle" | "sign" | "bench" | "fence" | "turbine" | "other";
  source: string;
  position: [number, number, number];
  size: [number, number, number];
  yaw: number;
};

type ReplacementModelKey = "tree" | "conifer" | "shrub" | "fern" | "grass" | "vehicle" | "bench" | "fence";

const replacementModelUrls: Record<ReplacementModelKey, string> = {
  tree: "/runtime-assets/models/replacements/deciduous-tree.glb",
  conifer: "/runtime-assets/models/replacements/conifer.glb",
  shrub: "/runtime-assets/models/replacements/shrub.glb",
  fern: "/runtime-assets/models/replacements/fern.glb",
  grass: "/runtime-assets/models/replacements/ornamental-grass.glb",
  vehicle: "/runtime-assets/models/replacements/car.glb",
  bench: "/runtime-assets/models/replacements/bench.glb",
  fence: "/runtime-assets/models/replacements/fence.glb",
};

function replacementModelKey(item: ReplacementInstance): ReplacementModelKey | null {
  if (item.category === "tree" || item.category === "conifer" || item.category === "vehicle" || item.category === "bench" || item.category === "fence") {
    return item.category;
  }
  if (item.category === "hedge") return "shrub";
  if (item.category !== "shrub") return null;
  if (/fern/i.test(item.source)) return "fern";
  if (/fountain grass|horsetail|rosemary/i.test(item.source)) return "grass";
  return "shrub";
}

function expandHedgeInstances(instances: readonly ReplacementInstance[]) {
  const expanded: ReplacementInstance[] = [];
  const localOffset = new THREE.Vector3();
  for (const item of instances) {
    if (item.category !== "hedge") {
      expanded.push(item);
      continue;
    }
    const [length, height, width] = item.size;
    const segments = THREE.MathUtils.clamp(Math.ceil(length / Math.max(width * 1.15, 0.9)), 1, 8);
    for (let index = 0; index < segments; index += 1) {
      localOffset.set(((index + 0.5) / segments - 0.5) * length, 0, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, item.yaw);
      expanded.push({
        ...item,
        position: [item.position[0] + localOffset.x, item.position[1], item.position[2] + localOffset.z],
        size: [length / segments * 1.12, height, width * 1.06],
      });
    }
  }
  return expanded;
}

function addStopSignReplacements(root: THREE.Group, instances: readonly ReplacementInstance[]) {
  if (!instances.length) return;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.translate(128, 128);
    context.beginPath();
    for (let index = 0; index < 8; index += 1) {
      const angle = Math.PI / 8 + index * Math.PI / 4;
      const x = Math.cos(angle) * 116;
      const y = Math.sin(angle) * 116;
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.closePath();
    context.fillStyle = "#b91f2a";
    context.fill();
    context.strokeStyle = "#f5f1e7";
    context.lineWidth = 11;
    context.stroke();
    context.fillStyle = "#fff";
    context.font = "700 64px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("STOP", 0, 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8a9193, roughness: 0.46, metalness: 0.7 });
  const faceMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.42, metalness: 0.08, side: THREE.DoubleSide });
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10), poleMaterial, instances.length);
  const face = new THREE.InstancedMesh(new THREE.CircleGeometry(0.5, 8), faceMaterial, instances.length);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  instances.forEach((item, index) => {
    const height = item.size[1];
    position.set(item.position[0], item.position[1] + height * 0.43, item.position[2]);
    quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, item.yaw);
    pole.setMatrixAt(index, matrix.compose(position, quaternion, scale.set(1, height * 0.86, 1)));
    position.y = item.position[1] + height * 0.78;
    quaternion.setFromEuler(new THREE.Euler(0, item.yaw, 0));
    face.setMatrixAt(index, matrix.compose(position, quaternion, scale.set(Math.max(item.size[0], 0.5), Math.max(item.size[0], 0.5), 1)));
  });
  pole.instanceMatrix.needsUpdate = true;
  face.instanceMatrix.needsUpdate = true;
  pole.castShadow = face.castShadow = true;
  pole.receiveShadow = face.receiveShadow = true;
  root.add(pole, face);
}

async function createConcordReplacementAssets(loader: GLTFLoader, rawInstances: readonly ReplacementInstance[]) {
  const root = new THREE.Group();
  root.name = "concord-replacement-assets";
  const instances = expandHedgeInstances(rawInstances);
  const grouped = new Map<ReplacementModelKey, ReplacementInstance[]>();
  for (const item of instances) {
    const key = replacementModelKey(item);
    if (!key) continue;
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const color = new THREE.Color();
  const carPalette = [0x284c66, 0xe1ded6, 0x34383b, 0x9f3c35, 0x8a8178, 0xb2b7bd];

  await Promise.all([...grouped.entries()].map(async ([key, items]) => {
    const gltf = await loader.loadAsync(replacementModelUrls[key]);
    gltf.scene.updateMatrixWorld(true);
    const sourceParts: Array<{ geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; colorize: boolean }> = [];
    const sourceBounds = new THREE.Box3();
    const rotateToLengthAxis = key === "vehicle" ? new THREE.Matrix4().makeRotationY(Math.PI / 2) : null;
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone();
      geometry.applyMatrix4(object.matrixWorld);
      if (rotateToLengthAxis) geometry.applyMatrix4(rotateToLengthAxis);
      geometry.computeBoundingBox();
      if (geometry.boundingBox) sourceBounds.union(geometry.boundingBox);
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const colorize = key === "vehicle" && objectMaterials.some((material) => /carpaint|car paint/i.test(material.name));
      const material: THREE.Material | THREE.Material[] = colorize
        ? objectMaterials.map((source) => {
          const clone = source.clone();
          if (clone instanceof THREE.MeshStandardMaterial) clone.color.set(0xffffff);
          return clone;
        })
        : object.material;
      sourceParts.push({ geometry, material, colorize });
    });

    const center = sourceBounds.getCenter(new THREE.Vector3());
    const sourceSize = sourceBounds.getSize(new THREE.Vector3());
    const normalize = new THREE.Matrix4().makeTranslation(-center.x, -sourceBounds.min.y, -center.z);
    for (const [partIndex, part] of sourceParts.entries()) {
      part.geometry.applyMatrix4(normalize);
      const mesh = new THREE.InstancedMesh(part.geometry, part.material, items.length);
      mesh.name = `replacement-${key}-${partIndex}`;
      mesh.castShadow = key === "tree" || key === "conifer" || key === "bench";
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      items.forEach((item, index) => {
        position.set(...item.position);
        quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, item.yaw);
        scale.set(
          item.size[0] / Math.max(sourceSize.x, 0.001),
          item.size[1] / Math.max(sourceSize.y, 0.001),
          item.size[2] / Math.max(sourceSize.z, 0.001),
        );
        mesh.setMatrixAt(index, matrix.compose(position, quaternion, scale));
        if (part.colorize) mesh.setColorAt(index, color.set(carPalette[index % carPalette.length]));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      root.add(mesh);
    }
  }));

  addStopSignReplacements(root, rawInstances.filter((item) => item.category === "sign"));
  return root;
}

function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of objectMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function makeVrHud() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 400;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.25), material);
  mesh.renderOrder = 1000;
  mesh.visible = false;
  return { canvas, texture, material, mesh };
}

function makeSoftParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 31);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.48, "rgba(255,255,255,.82)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

function updateVrHud(
  canvas: HTMLCanvasElement,
  texture: THREE.CanvasTexture,
  record: AirRecord | null,
  hour: number,
  sceneLabel: string,
  narrationStatus: NarrationStatus,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(5, 12, 15, .88)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(217, 255, 104, .7)";
  context.lineWidth = 4;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  context.fillStyle = "rgba(243, 241, 233, .7)";
  context.font = "30px Arial";
  context.fillText(sceneLabel.toUpperCase(), 42, 55);
  context.fillStyle = "#d9ff68";
  context.font = "600 28px Arial";
  context.fillText("PM2.5 CONCENTRATION (µg/m³)", 42, 102);
  context.font = "600 72px Arial";
  context.fillText(record ? record.pm25_ug_m3.toFixed(1) : "—", 42, 168);
  context.fillStyle = "#f3f1e9";
  context.font = "500 44px Arial";
  context.fillText(`${String(hour).padStart(2, "0")}:00`, 42, 226);
  context.fillStyle = "rgba(243, 241, 233, .68)";
  context.font = "30px Arial";
  const wind = record?.wind_speed_m_s;
  const direction = record?.wind_direction_deg;
  context.fillText(wind === null || wind === undefined ? "PM2.5 Concentration · Grasshopper profile" : `Wind ${wind.toFixed(1)} m/s · ${direction?.toFixed(0) ?? "—"}°`, 42, 286);
  context.fillStyle = narrationStatus === "playing" ? "#d9ff68" : "rgba(243, 241, 233, .58)";
  context.fillText(`Narration ${narrationStatus.toUpperCase()}`, 42, 342);
  texture.needsUpdate = true;
}

function createConcordParticles(scene: THREE.Scene, mount: HTMLElement, config: ConcordPopulateConfig) {
  const groups = config.groups.map((group) => {
    const counts = concordPopulateCounts(group.pmSeries, group.particleRange);
    const capacity = group.particleRange[1];
    const positions = deterministicBoxPopulation(group.box.min, group.box.max, capacity, config.randomSeed);
    const geometry = new THREE.SphereGeometry(group.radius, 6, 4);
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
    });
    const instances = new THREE.InstancedMesh(geometry, material, capacity);
    const matrix = new THREE.Matrix4();
    positions.forEach((position, index) => instances.setMatrixAt(index, matrix.makeTranslation(...position)));
    instances.instanceMatrix.needsUpdate = true;
    instances.count = 0;
    instances.frustumCulled = false;
    scene.add(instances);
    return { geometry, material, instances, counts, id: group.id };
  });

  let previousHour = -1;
  return {
    update(hour: number) {
      if (hour === previousHour) return;
      let total = 0;
      for (const group of groups) {
        const count = group.counts[hour % 24];
        group.instances.count = count;
        total += count;
        mount.dataset[`particle${group.id.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase())}`] = String(count);
      }
      mount.dataset.particleCount = String(total);
      mount.dataset.particleMode = config.kind;
      previousHour = hour;
    },
    dispose() {
      for (const group of groups) {
        scene.remove(group.instances);
        group.geometry.dispose();
        group.material.dispose();
      }
    },
  };
}

function createSouthParkParticles(
  scene: THREE.Scene,
  mount: HTMLElement,
  config: SouthParkWindConfig,
  simulationSeed: number,
) {
  const geometry = new THREE.BufferGeometry();
  const buffer = new Float32Array(MAX_PARTICLES * 3);
  const attribute = new THREE.BufferAttribute(buffer, 3);
  attribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", attribute);
  const spriteTexture = makeSoftParticleTexture();
  const material = new THREE.PointsMaterial({
    color: 0x78c8ff,
    map: spriteTexture,
    size: config.cloudDisplay.sizePx,
    sizeAttenuation: false,
    transparent: true,
    opacity: config.cloudDisplay.opacity,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const states: ParticleState[] = [];
  const previousPositions: Vec3[] = [];
  const random = makeRandom(simulationSeed);
  const inside = makeExtrudedPolygonBoundary(
    config.boundary.polygonsXZ,
    config.boundary.minY,
    config.boundary.maxY,
    config.boundary.toleranceM,
  );
  const simulationStepMs = 1000 / config.motion.simulationHz;
  const simulationDt = config.integrationDt / config.motion.substepsPerGrasshopperStep;
  let active = 0;
  let lastRecordKey = "";
  let currentRecord: AirRecord | null = null;
  let currentWindDirection: [number, number] = [0, 0];
  let lastSimulationAt = performance.now();
  let stepCount = 0;

  function initializeParticle(index: number, record: AirRecord, windDirection: readonly [number, number]) {
    let particle = initializeSouthParkParticle(
      config.seeds[index % config.seeds.length],
      windDirection,
      record.street_speed_m_s,
      config.windSpeedMultiplier,
      random,
    );
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * config.motion.sourceSpreadM;
      const candidate: Vec3 = [
        particle.position[0] + Math.cos(angle) * radius,
        particle.position[1],
        particle.position[2] + Math.sin(angle) * radius,
      ];
      if (inside(candidate)) {
        particle = { ...particle, position: candidate };
        break;
      }
    }
    const warmupSteps = Math.floor(random() * (config.motion.warmupSteps + 1));
    for (let step = 0; step < warmupSteps; step += 1) {
      particle = stepSouthParkRoadParticle(
        particle,
        windDirection,
        record.street_speed_m_s,
        config.windSpeedMultiplier,
        simulationDt,
        random,
        inside,
      );
    }
    return particle;
  }

  function advance(record: AirRecord | null) {
    if (!record || record.local_time === lastRecordKey) return;
    const nextActive = targetParticleCount(record.pm25_ug_m3);
    const windDirection = windVectorXZ(record.wind_u, record.wind_v, record.wind_direction_deg ?? 0);
    for (let index = 0; index < nextActive; index += 1) {
      if (!states[index]) {
        const initial = initializeParticle(index, record, windDirection);
        states[index] = initial;
        previousPositions[index] = [...initial.position];
      } else {
        previousPositions[index] = [...states[index].position];
      }
    }
    currentRecord = record;
    currentWindDirection = windDirection;
    active = nextActive;
    geometry.setDrawRange(0, active);
    material.color.setRGB(...particleRgb(record.pm25_ug_m3), THREE.SRGBColorSpace);
    mount.dataset.particleCount = String(active);
    mount.dataset.particlePm25 = record.pm25_ug_m3.toFixed(2);
    mount.dataset.particleMode = config.kind;
    lastRecordKey = record.local_time;
  }

  function simulateStep() {
    if (!currentRecord) return;
    for (let index = 0; index < active; index += 1) {
      previousPositions[index] = [...states[index].position];
      states[index] = stepSouthParkRoadParticle(
        states[index],
        currentWindDirection,
        currentRecord.street_speed_m_s,
        config.windSpeedMultiplier,
        simulationDt,
        random,
        inside,
      );
    }
    mount.dataset.particleStepCount = String(stepCount += 1);
  }

  function render(now: number) {
    let catchUpSteps = 0;
    while (now - lastSimulationAt >= simulationStepMs && catchUpSteps < 4) {
      lastSimulationAt += simulationStepMs;
      simulateStep();
      catchUpSteps += 1;
    }
    if (catchUpSteps === 4 && now - lastSimulationAt >= simulationStepMs) lastSimulationAt = now;
    const alpha = Math.max(0, Math.min((now - lastSimulationAt) / simulationStepMs, 1));
    for (let index = 0; index < active; index += 1) {
      const position = interpolatePosition(previousPositions[index], states[index].position, alpha);
      const offset = index * 3;
      buffer[offset] = position[0];
      buffer[offset + 1] = position[1];
      buffer[offset + 2] = position[2];
    }
    attribute.needsUpdate = true;
  }

  return {
    advance,
    render,
    dispose() {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      spriteTexture.dispose();
    },
  };
}

export function SceneCanvas({
  record,
  hour,
  narrationStatus,
  simulationSeed,
  vrButtonHostId,
  onVrSupport,
  sceneConfig,
  onSceneStatus,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ record, hour, narrationStatus });

  useEffect(() => {
    stateRef.current = { record, hour, narrationStatus };
  }, [record, hour, narrationStatus]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mountElement = mount;
    let cancelled = false;
    const abortController = new AbortController();
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x9bb8c8);
    scene.fog = new THREE.FogExp2(fogColor, sceneConfig.fogDensity * 0.72);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 6500);
    camera.position.set(...sceneConfig.cameraPosition);
    const player = new THREE.Group();
    player.add(camera);
    scene.add(player);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...sceneConfig.cameraTarget);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 5;
    controls.maxDistance = sceneConfig.maxDistance;

    const hemisphere = new THREE.HemisphereLight(0xbadcf1, 0x48543a, 0.82);
    scene.add(hemisphere);
    const ambient = new THREE.AmbientLight(0xd8e4e8, 0.16);
    scene.add(ambient);
    const isSouthPark = sceneConfig.id === "south-park";
    const sun = new THREE.DirectionalLight(0xfff0d0, 3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(isSouthPark ? 2048 : 1024, isSouthPark ? 2048 : 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = isSouthPark ? 3200 : 700;
    const shadowExtent = isSouthPark ? 1800 : 180;
    sun.shadow.camera.left = -shadowExtent;
    sun.shadow.camera.right = shadowExtent;
    sun.shadow.camera.top = shadowExtent;
    sun.shadow.camera.bottom = -shadowExtent;
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = isSouthPark ? 0.35 : 0.03;
    scene.add(sun);
    scene.add(sun.target);
    const sunOrbit = isSouthPark ? 900 : 55;
    const sky = new Sky();
    sky.name = "atmospheric-sky";
    sky.scale.setScalar(5000);
    sky.frustumCulled = false;
    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 7.5;
    skyUniforms.rayleigh.value = 1.7;
    skyUniforms.mieCoefficient.value = 0.006;
    skyUniforms.mieDirectionalG.value = 0.82;
    scene.add(sky);
    const nightColor = new THREE.Color(0x050a12);
    const dayFogColor = new THREE.Color(0xa9c5d3);
    const dawnFogColor = new THREE.Color(0xc99b78);
    const sunWarm = new THREE.Color(0xffae72);
    const sunNoon = new THREE.Color(0xfff5dc);
    const sunPosition = new THREE.Vector3();
    const teleportTargets: THREE.Object3D[] = [];
    const loadedAssets: THREE.Object3D[] = [];

    const concordParticles = sceneConfig.particles.kind === "concord-populate"
      ? createConcordParticles(scene, mount, sceneConfig.particles)
      : null;
    const southParkParticles = sceneConfig.particles.kind === "south-park-wind"
      ? createSouthParkParticles(scene, mount, sceneConfig.particles, simulationSeed)
      : null;
    const vrHud = makeVrHud();
    vrHud.mesh.position.set(0, 1.8, -2.8);
    player.add(vrHud.mesh);

    onSceneStatus("Loading");
    fetch(sceneConfig.manifestUrl, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Manifest ${response.status}`);
        return response.json();
      })
      .then((manifest: {
        asset_mode?: "enscape-proxies" | "realistic-replacements";
        chunks?: Array<{ id: string; url: string | null; status: string; role: "visual" | "collider" }>;
        replacement_instances?: { url: string; status: string };
      }) => {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        const readyChunks = (manifest.chunks ?? []).filter((chunk) => chunk.url && chunk.status === "ready");
        if (!readyChunks.length) throw new Error("Manifest has no ready chunks");
        const replacementUrl = manifest.asset_mode === "realistic-replacements" && manifest.replacement_instances?.status === "available"
          ? manifest.replacement_instances.url
          : null;
        const expectedCount = readyChunks.length + (replacementUrl ? 1 : 0);
        let loadedCount = 0;
        let failedCount = 0;
        const updateStatus = () => {
          if (!cancelled) onSceneStatus(failedCount ? `${loadedCount}/${expectedCount} ready · ${failedCount} failed` : `${loadedCount}/${expectedCount} ready`);
        };
        for (const chunk of readyChunks) {
          loader.load(chunk.url!, (gltf) => {
            if (cancelled) {
              disposeObject(gltf.scene);
              return;
            }
            gltf.scene.traverse((object) => {
              if (!(object instanceof THREE.Mesh)) return;
              object.castShadow = false;
              object.receiveShadow = chunk.role === "visual";
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              for (const material of materials) {
                if (/Door glass|Curtain glass|^Glass$/i.test(material.name)) {
                  material.transparent = true;
                  material.depthWrite = false;
                }
                if (/Concrete trim/i.test(material.name)) {
                  material.polygonOffset = true;
                  material.polygonOffsetFactor = -1;
                  material.polygonOffsetUnits = -1;
                } else if (/Ground asphalt/i.test(material.name)) {
                  material.polygonOffset = true;
                  material.polygonOffsetFactor = -1;
                  material.polygonOffsetUnits = -1;
                } else if (/Ground grass/i.test(material.name)) {
                  material.polygonOffset = true;
                  material.polygonOffsetFactor = -2;
                  material.polygonOffsetUnits = -2;
                } else if (/Ground .*paving/i.test(material.name)) {
                  material.polygonOffset = true;
                  material.polygonOffsetFactor = -3;
                  material.polygonOffsetUnits = -3;
                }
              }
              const architecturalShadowCaster = chunk.id === "school_core"
                || chunk.id === "school_buildings"
                || chunk.id === "south_park_buildings";
              if (chunk.role === "visual" && architecturalShadowCaster) object.castShadow = true;
              if (chunk.role === "collider") {
                object.visible = false;
                teleportTargets.push(object);
              }
            });
            loadedAssets.push(gltf.scene);
            scene.add(gltf.scene);
            loadedCount += 1;
            updateStatus();
          }, undefined, () => {
            if (cancelled) return;
            failedCount += 1;
            updateStatus();
          });
        }
        if (replacementUrl) {
          fetch(replacementUrl, { signal: abortController.signal })
            .then((response) => {
              if (!response.ok) throw new Error(`Replacement instances ${response.status}`);
              return response.json() as Promise<{ instances: ReplacementInstance[] }>;
            })
            .then((data) => {
              if (cancelled) return;
              return createConcordReplacementAssets(loader, data.instances);
            })
            .then((replacements) => {
              if (!replacements) return;
              if (cancelled) {
                disposeObject(replacements);
                return;
              }
              loadedAssets.push(replacements);
              scene.add(replacements);
              loadedCount += 1;
              updateStatus();
            })
            .catch((error: unknown) => {
              if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
              failedCount += 1;
              updateStatus();
            });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) onSceneStatus("Model unavailable");
      });

    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    const headsetPosition = new THREE.Vector3();
    const controllers: THREE.Group[] = [];
    const controllerLines: THREE.Line[] = [];
    const selectHandlers: Array<() => void> = [];
    for (let index = 0; index < 2; index += 1) {
      const controller = renderer.xr.getController(index);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -12)]),
        new THREE.LineBasicMaterial({ color: 0x99e6d6 }),
      );
      const handleSelect = () => {
        if (!teleportTargets.length) return;
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        const hit = raycaster.intersectObjects(teleportTargets, true)[0];
        if (!hit) return;
        headsetPosition.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld);
        player.position.x += hit.point.x - headsetPosition.x;
        player.position.z += hit.point.z - headsetPosition.z;
      };
      controller.add(line);
      controller.addEventListener("selectend", handleSelect);
      scene.add(controller);
      controllers.push(controller);
      controllerLines.push(line);
      selectHandlers.push(handleSelect);
    }

    const vrButton = VRButton.createButton(renderer);
    vrButton.className = "vr-entry";
    vrButton.setAttribute("aria-label", "Enter VR");
    const guardDuplicateSession = (event: MouseEvent) => {
      const rendererSession = renderer.xr.getSession();
      const activeSession = xrGlobal.__phiActiveImmersiveSession ?? null;
      if (activeSession && activeSession !== rendererSession) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void activeSession.end().catch(() => undefined);
      }
    };
    vrButton.addEventListener("click", guardDuplicateSession, true);
    const vrButtonHost = document.getElementById(vrButtonHostId) ?? mount;
    vrButtonHost.querySelectorAll(".vr-entry").forEach((button) => button.remove());
    vrButtonHost.appendChild(vrButton);
    const xrNavigator = navigator as Navigator & { xr?: { isSessionSupported(mode: string): Promise<boolean> } };
    xrNavigator.xr?.isSessionSupported("immersive-vr")
      .then((supported) => { if (!cancelled) onVrSupport(supported); })
      .catch(() => { if (!cancelled) onVrSupport(false); });

    const desktopCameraPosition = camera.position.clone();
    const desktopTarget = controls.target.clone();
    const handleSessionStart = () => {
      xrGlobal.__phiActiveImmersiveSession = renderer.xr.getSession();
      controls.enabled = false;
      camera.position.set(0, 1.6, 0);
      player.position.set(...sceneConfig.xrStart);
      vrHud.mesh.visible = true;
    };
    const handleSessionEnd = () => {
      if (xrGlobal.__phiActiveImmersiveSession === renderer.xr.getSession()) {
        xrGlobal.__phiActiveImmersiveSession = null;
      }
      player.position.set(0, 0, 0);
      player.rotation.set(0, 0, 0);
      camera.position.copy(desktopCameraPosition);
      controls.target.copy(desktopTarget);
      controls.enabled = true;
      vrHud.mesh.visible = false;
    };
    renderer.xr.addEventListener("sessionstart", handleSessionStart);
    renderer.xr.addEventListener("sessionend", handleSessionEnd);

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const beforeTurn = new THREE.Vector3();
    const afterTurn = new THREE.Vector3();
    const snapLatch = new Map<string, boolean>();
    function updateXrLocomotion(delta: number) {
      const session = renderer.xr.getSession() as null | { inputSources: Iterable<{ handedness: string; gamepad?: Gamepad }> };
      if (!session) return;
      for (const source of session.inputSources) {
        const axes = source.gamepad?.axes;
        if (!axes || axes.length < 2) continue;
        const x = axes.length >= 4 ? axes[2] : axes[0];
        const y = axes.length >= 4 ? axes[3] : axes[1];
        if (source.handedness !== "right" && Math.hypot(x, y) > 0.16) {
          renderer.xr.getCamera().getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          right.set(forward.z, 0, -forward.x);
          player.position.addScaledVector(forward, -y * delta * 2.2).addScaledVector(right, x * delta * 2.2);
        }
        const key = source.handedness || "controller";
        const latched = snapLatch.get(key) ?? false;
        if (source.handedness === "right" && Math.abs(x) > 0.78 && !latched) {
          renderer.xr.getCamera().getWorldPosition(beforeTurn);
          player.rotation.y -= Math.sign(x) * Math.PI / 6;
          player.updateMatrixWorld(true);
          renderer.xr.getCamera().getWorldPosition(afterTurn);
          player.position.add(beforeTurn.sub(afterTurn));
          snapLatch.set(key, true);
        } else if (Math.abs(x) < 0.35) {
          snapLatch.set(key, false);
        }
      }
    }

    function resize() {
      const width = mountElement.clientWidth;
      const height = mountElement.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const clock = new THREE.Clock();
    let previousHudKey = "";

    renderer.setAnimationLoop((time) => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const current = stateRef.current.record;
      const currentHour = stateRef.current.hour;
      concordParticles?.update(currentHour);
      southParkParticles?.advance(current);
      southParkParticles?.render(time);
      updateXrLocomotion(delta);

      const sunAngle = ((currentHour - 6) / 24) * Math.PI * 2;
      const rawAltitude = Math.sin(sunAngle);
      const altitude = Math.max(rawAltitude, -0.22);
      sunPosition.set(Math.cos(sunAngle) * sunOrbit, altitude * sunOrbit, Math.sin(sunAngle) * sunOrbit * 0.65);
      sun.position.copy(sunPosition);
      skyUniforms.sunPosition.value.copy(sunPosition).normalize();
      const daylight = THREE.MathUtils.smoothstep(rawAltitude, -0.08, 0.28);
      const noon = THREE.MathUtils.smoothstep(rawAltitude, 0.08, 0.9);
      sun.intensity = daylight * (1.2 + Math.max(rawAltitude, 0) * 3.5);
      sun.color.lerpColors(sunWarm, sunNoon, noon);
      hemisphere.intensity = 0.18 + daylight * 0.78;
      ambient.intensity = 0.08 + daylight * 0.14;
      renderer.toneMappingExposure = 0.72 + daylight * 0.45;
      skyUniforms.rayleigh.value = 0.35 + daylight * 1.55;
      fogColor.lerpColors(nightColor, dawnFogColor, THREE.MathUtils.smoothstep(rawAltitude, -0.16, 0.04));
      fogColor.lerp(dayFogColor, THREE.MathUtils.smoothstep(rawAltitude, 0.02, 0.55));
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color.copy(fogColor);

      const hudKey = `${currentHour}:${current?.pm25_ug_m3}:${stateRef.current.narrationStatus}`;
      if (hudKey !== previousHudKey) {
        updateVrHud(vrHud.canvas, vrHud.texture, current, currentHour, sceneConfig.label, stateRef.current.narrationStatus);
        previousHudKey = hudKey;
      }
      controls.update();
      renderer.render(scene, camera);
    });

    resize();
    return () => {
      cancelled = true;
      abortController.abort();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      renderer.xr.removeEventListener("sessionstart", handleSessionStart);
      renderer.xr.removeEventListener("sessionend", handleSessionEnd);
      vrButton.removeEventListener("click", guardDuplicateSession, true);
      const session = renderer.xr.getSession() ?? xrGlobal.__phiActiveImmersiveSession ?? null;
      if (session) {
        if (xrGlobal.__phiActiveImmersiveSession === session) xrGlobal.__phiActiveImmersiveSession = null;
        void session.end().catch(() => undefined);
      }
      controls.dispose();
      concordParticles?.dispose();
      southParkParticles?.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
      vrHud.mesh.geometry.dispose();
      vrHud.material.dispose();
      vrHud.texture.dispose();
      vrButton.remove();
      controllers.forEach((controller, index) => {
        controller.removeEventListener("selectend" as never, selectHandlers[index] as never);
        controller.clear();
      });
      controllerLines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      loadedAssets.forEach((asset) => {
        scene.remove(asset);
        disposeObject(asset);
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onSceneStatus, onVrSupport, sceneConfig, simulationSeed, vrButtonHostId]);

  return <div className="scene-canvas" ref={mountRef} aria-label="Interactive air-quality scene" />;
}
