import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { CONCORD_PARTICLE_GROUPS, CONCORD_PM_SERIES, SOUTH_PARK_SEEDS } from "../app/data/experienceData.ts";
import { concordPopulateCounts, makeExtrudedPolygonBoundary } from "../app/lib/particleModel.ts";

const boundary = JSON.parse(await fs.readFile(new URL("../public/runtime-assets/boundaries/south-park-road-volume.json", import.meta.url), "utf8"));

test("preserves all 24 hours of the six original Concord Populate3D groups", () => {
  assert.equal(CONCORD_PARTICLE_GROUPS.length, 6);
  assert.equal(CONCORD_PM_SERIES.length, 6);
  for (const group of CONCORD_PARTICLE_GROUPS) assert.equal(group.pmSeries.length, 24);
  assert.deepEqual(CONCORD_PARTICLE_GROUPS.map((group) => group.particleRange), [[100, 10000], [100, 2000], [100, 2000], [100, 2000], [100, 2000], [100, 2000]]);
  assert.deepEqual(CONCORD_PARTICLE_GROUPS.map((group) => group.radius), [0.3, 0.01, 0.01, 0.01, 0.01, 0.01]);
  const groupCounts = CONCORD_PARTICLE_GROUPS.map((group) => concordPopulateCounts(group.pmSeries, group.particleRange));
  assert.deepEqual(
    Array.from({ length: 24 }, (_, hour) => groupCounts.reduce((sum, counts) => sum + counts[hour], 0)),
    [6229,4229,5510,5601,7018,10532,10543,13504,13658,8957,8029,6489,7434,9029,9258,8998,6866,9349,11785,9192,5937,3063,2416,3781],
  );
  assert.ok(CONCORD_PARTICLE_GROUPS[0].box.min[0] < -100);
  assert.ok(CONCORD_PARTICLE_GROUPS[0].box.max[1] > 23);
});

test("restores the South Park Grasshopper road-air volume and five GIS seeds", () => {
  assert.equal(boundary.role, "particle-boundary");
  assert.equal(boundary.extrusion_m, 30);
  assert.equal(boundary.polygons_xz.length, 408);
  assert.ok(boundary.polygons_xz.reduce((sum, polygon) => sum + polygon.length, 0) > 2000);
  assert.deepEqual(boundary.bounds.min, [-950.928209, 0.1, -1161.449458]);
  assert.deepEqual(boundary.bounds.max, [894.99465, 30.1, 1336.441083]);
  assert.equal(SOUTH_PARK_SEEDS.length, 5);
  const inside = makeExtrudedPolygonBoundary(boundary.polygons_xz, boundary.min_y, boundary.max_y, 4);
  for (const [x, , z] of SOUTH_PARK_SEEDS) assert.equal(inside([x, 10, z]), true);
  assert.equal(inside([1100, 10, 0]), false);
  assert.equal(inside([0, 31, 0]), false);
});
