import assert from "node:assert/strict";
import test from "node:test";
import {
  GRASSHOPPER_DT,
  concordPopulateCountAt,
  concordPopulateCounts,
  deterministicBoxPopulation,
  initializeSouthParkParticle,
  insideExtrudedPolygon,
  interpolatePosition,
  makeExtrudedPolygonBoundary,
  MAX_PARTICLES,
  MIN_PARTICLES,
  particleRgb,
  targetParticleCount,
  stepSouthParkRoadParticle,
  stepSouthParkParticle,
  windVectorXZ,
} from "../app/lib/particleModel.ts";

test("preserves Grasshopper count mapping and truncation", () => {
  assert.equal(MIN_PARTICLES, 200);
  assert.equal(MAX_PARTICLES, 2000);
  assert.equal(GRASSHOPPER_DT, 0.8);
  assert.equal(targetParticleCount(0), 200);
  assert.equal(targetParticleCount(25), 1100);
  assert.equal(targetParticleCount(50), 2000);
  assert.equal(targetParticleCount(12.34), 644);
  assert.equal(targetParticleCount(100), 2000);
});

test("initializes from a real seed with 2–20m height and graph-level ×10 wind", () => {
  const particle = initializeSouthParkParticle([1, 2, 3], [1, 0], 0.5, 10, () => 0.5);
  assert.deepEqual(particle.position, [1, 13, 3]);
  assert.deepEqual(particle.velocity, [25, 0, 0]);
});

test("performs exactly one injectable deterministic Grasshopper step", () => {
  const state = { position: [0, 10, 0], velocity: [10, 0, 0] };
  const stepped = stepSouthParkParticle(state, [1, 0], 0.5, 10, 0.8, () => 0.5, () => true);
  assert.deepEqual(stepped.velocity, [11, 0, 0]);
  assert.deepEqual(stepped.position, [8.8, 10, 0]);

  const bounced = stepSouthParkParticle(state, [1, 0], 0.5, 10, 0.8, () => 0.5, () => false);
  assert.deepEqual(bounced.velocity, [-3.3, -0, -0]);
  assert.deepEqual(bounced.position, [-2.64, 10, 0]);
});

test("turns a blocked particle along a narrow road instead of pinning it at the edge", () => {
  const road = [[-1, -10], [-1, 10], [1, 10], [1, -10]];
  const inside = (position) => insideExtrudedPolygon(position, road, 0, 20);
  const state = { position: [0, 5, 0], velocity: [10, 0, 0] };
  const stepped = stepSouthParkRoadParticle(state, [1, 0], 0.5, 10, 0.8, () => 0.5, inside);
  assert.equal(inside(stepped.position), true);
  assert.ok(Math.hypot(stepped.position[0], stepped.position[2]) > 1);
  assert.ok(Math.abs(stepped.position[2]) > Math.abs(stepped.position[0]));
});

test("checks the extruded CFD polygon and interpolates without extra integration", () => {
  const polygon = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
  assert.equal(insideExtrudedPolygon([0, 5, 0], polygon, 0, 10), true);
  assert.equal(insideExtrudedPolygon([2, 5, 0], polygon, 0, 10), false);
  assert.equal(insideExtrudedPolygon([0, 11, 0], polygon, 0, 10), false);
  assert.deepEqual(interpolatePosition([0, 0, 0], [10, 20, 30], 0.25), [2.5, 5, 7.5]);
});

test("checks a road-network extrusion with a small GIS alignment tolerance", () => {
  const roads = [
    [[-10, -2], [-10, 2], [10, 2], [10, -2]],
    [[-2, -10], [-2, 10], [2, 10], [2, -10]],
  ];
  const inside = makeExtrudedPolygonBoundary(roads, 0, 30, 1);
  assert.equal(inside([8, 5, 0]), true);
  assert.equal(inside([8, 5, 2.5]), true);
  assert.equal(inside([8, 5, 4]), false);
  assert.equal(inside([0, 31, 0]), false);
});

test("Concord Populate3D positions are fixed by an injectable seed", () => {
  const first = deterministicBoxPopulation([-1, 0, -2], [1, 3, 2], 4, 1);
  const second = deterministicBoxPopulation([-1, 0, -2], [1, 3, 2], 4, 1);
  assert.deepEqual(first, second);
  for (const [x, y, z] of first) {
    assert.ok(x >= -1 && x <= 1);
    assert.ok(y >= 0 && y <= 3);
    assert.ok(z >= -2 && z <= 2);
  }
});

test("Concord reproduces the round, square and per-profile remap graph", () => {
  const pm = [3.36, 21.64, 29.75];
  assert.deepEqual(concordPopulateCounts(pm, [100, 10000]), [100, 5378, 10000]);
  assert.equal(concordPopulateCountAt(pm, [100, 10000], 4), 5378);
  assert.deepEqual(concordPopulateCounts([12, 12], [100, 2000]), [100, 100]);
});

test("preserves Grasshopper PM color endpoints", () => {
  assert.deepEqual(particleRgb(0), [120 / 255, 200 / 255, 1]);
  assert.deepEqual(particleRgb(50), [1, 120 / 255, 105 / 255]);
});

test("converts Rhino XY wind vectors to Three.js XZ", () => {
  assert.deepEqual(windVectorXZ(1, 0, 0), [1, -0]);
  assert.deepEqual(windVectorXZ(0, 1, 0), [0, -1]);
  const [x, z] = windVectorXZ(0, 0, 90);
  assert.ok(Math.abs(x + 1) < 1e-12);
  assert.ok(Math.abs(z) < 1e-12);
});
