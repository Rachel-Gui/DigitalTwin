import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const publicDir = path.resolve(fileURLToPath(new URL("../public", import.meta.url)));
const manifests = ["assets/scene-manifest.json", "assets/south-park-scene-manifest.json"];

function parseGlbJson(bytes) {
  const jsonLength = bytes.readUInt32LE(12);
  return JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").replace(/[\0 ]+$/, ""));
}

function glbBounds(gltf) {
  const positions = (gltf.meshes ?? []).flatMap((mesh) => mesh.primitives ?? []).map(
    (primitive) => gltf.accessors[primitive.attributes.POSITION],
  );
  return {
    min: [0, 1, 2].map((axis) => Math.min(...positions.map((position) => position.min[axis]))),
    max: [0, 1, 2].map((axis) => Math.max(...positions.map((position) => position.max[axis]))),
  };
}

for (const manifestPath of manifests) {
  test(`${manifestPath} references valid GLB assets`, async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(publicDir, manifestPath), "utf8"));
    assert.equal(manifest.schema_version, "1.0.0");
    assert.ok(manifest.chunks.length >= 2);
    assert.equal(manifest.chunks.filter((chunk) => chunk.role === "collider").length, 1);
    assert.ok(manifest.chunks.filter((chunk) => chunk.role === "visual").length >= 3);
    assert.equal(manifest.particle_boundary.role, "particle-boundary");
    assert.equal(manifest.particle_boundary.status, "ready");
    assert.equal(manifest.runtime.source_units, "millimeters");
    assert.equal(manifest.runtime.meters_per_source_unit, 0.001);
    assert.equal(manifest.runtime.axis_transform, "Rhino XYZ to Three.js X,Z,-Y");
    assert.equal(manifest.runtime.camera_position.length, 3);
    assert.equal(manifest.runtime.xr_start.length, 3);

    if (manifest.scene_id === "concord-school-webxr-mvp") {
      assert.deepEqual(manifest.runtime.camera_position, [-67.546, 15.064, -37.667]);
      assert.deepEqual(manifest.runtime.camera_target, [-40.681, -0.514, -19.261]);
      assert.equal(manifest.asset_mode, "enscape-proxies");
      assert.equal(manifest.replacement_instances.status, "available");
      const replacements = JSON.parse(await fs.readFile(path.join(publicDir, manifest.replacement_instances.url)));
      assert.equal(replacements.instances.length, 514);
      assert.equal(replacements.counts.vehicle, 45);
      assert.equal(replacements.counts.tree + replacements.counts.conifer, 30);
      assert.equal(Object.keys(manifest.replacement_models).length, 8);
      for (const model of Object.values(manifest.replacement_models)) {
        assert.equal(model.status, "ready");
        await fs.access(path.join(publicDir, model.url));
      }
      const plantChunk = manifest.chunks.find((chunk) => chunk.id === "school_plants");
      const vehicleChunk = manifest.chunks.find((chunk) => chunk.id === "school_vehicles");
      assert.equal(plantChunk.status, "ready");
      assert.equal(vehicleChunk.status, "ready");
      assert.match(vehicleChunk.source, /neutral-grey/);
      const contextChunk = manifest.chunks.find((chunk) => chunk.id === "school_context");
      const contextGltf = parseGlbJson(await fs.readFile(path.join(publicDir, contextChunk.url)));
      const contextMaterials = new Set(contextGltf.materials.map((material) => material.name));
      for (const materialName of ["Ground grass", "Ground asphalt"]) assert.ok(contextMaterials.has(materialName));
      assert.ok(!contextMaterials.has("Ground paving"));
      assert.equal(contextGltf.materials.find((material) => material.name === "Ground asphalt").extras.uvTileMeters, 2);
      assert.equal(contextGltf.materials.find((material) => material.name === "Asphalt").extras.uvTileMeters, 2);
      const contextImages = new Set(contextGltf.images.map((image) => image.name));
      for (const imageName of ["Grass_04_albedo_1k.png", "Road_10_Albedo_1k.png"]) {
        assert.ok(contextImages.has(imageName), `${imageName} was replaced by a layer-wide fallback texture`);
      }
      assert.ok(!contextImages.has("Hay_Albedo_512.png"));
      const vehicleGltf = parseGlbJson(await fs.readFile(path.join(publicDir, vehicleChunk.url)));
      assert.equal(vehicleGltf.materials[0].name, "Vehicle neutral grey");
      assert.deepEqual(vehicleGltf.materials[0].pbrMetallicRoughness.baseColorFactor, [0.38, 0.4, 0.42, 1]);
      const coreChunk = manifest.chunks.find((chunk) => chunk.id === "school_core");
      const coreGltf = parseGlbJson(await fs.readFile(path.join(publicDir, coreChunk.url)));
      const doorGlass = coreGltf.materials.find((material) => material.name === "Door glass");
      assert.equal(doorGlass.alphaMode, "BLEND");
      const coreMaterials = new Set(coreGltf.materials.map((material) => material.name));
      for (const materialName of [
        "Canopy roof", "Canopy supports", "Curtain frame", "Curtain glass",
        "Door frame", "Stair concrete", "Stair stone",
      ]) assert.ok(coreMaterials.has(materialName), `${materialName} was merged or omitted`);

      for (const chunk of manifest.chunks.filter((item) => item.role === "visual")) {
        const gltf = parseGlbJson(await fs.readFile(path.join(publicDir, chunk.url)));
        const bounds = glbBounds(gltf);
        for (const value of [...bounds.min, ...bounds.max]) {
          assert.ok(Math.abs(value) < 400, `${chunk.id} was exported outside the local campus coordinate frame`);
        }
      }

      const materialAudit = JSON.parse(await fs.readFile(path.resolve(publicDir, "../reports/rhino-material-audit.json"), "utf8"));
      const groundLayer = materialAudit.layers.find((layer) => layer.path === "GLASS::A-DOOR-FRAM");
      assert.deepEqual(Object.keys(groundLayer.materials).sort(), ["Grass 04", "Plastic 07, Hay", "Road 10", "石膏 (12)"].sort());
    }

    if (manifest.scene_id === "south-park-webxr") {
      assert.deepEqual(manifest.runtime.camera_position, [-311.371, 373.454, 1287.732]);
      assert.deepEqual(manifest.runtime.camera_target, [-202.914, 25, 677.368]);
      const ids = new Set(manifest.chunks.map((chunk) => chunk.id));
      assert.ok(ids.has("south_park_ground"));
      assert.ok(ids.has("south_park_roads"));
      assert.ok(ids.has("south_park_buildings"));
      assert.equal(manifest.particle_boundary.id, "south-park-road-air-volume");
      for (const [id, materialName] of [["south_park_ground", "South Park ground"], ["south_park_roads", "South Park roads"]]) {
        const chunk = manifest.chunks.find((item) => item.id === id);
        const gltf = parseGlbJson(await fs.readFile(path.join(publicDir, chunk.url)));
        const position = gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION];
        assert.equal(gltf.materials[0].name, materialName);
        assert.ok(position.max[0] - position.min[0] > 1500, `${id} does not span the neighborhood`);
        assert.ok(position.max[2] - position.min[2] > 2000, `${id} does not span the neighborhood`);
      }
      const buildingChunk = manifest.chunks.find((item) => item.id === "south_park_buildings");
      const buildingGltf = parseGlbJson(await fs.readFile(path.join(publicDir, buildingChunk.url)));
      assert.equal(buildingGltf.extras.buildingCount, 1432);
      assert.equal(buildingGltf.extras.heightMeters.min, 6.87);
      assert.equal(buildingGltf.extras.heightMeters.max, 30.32);
      assert.ok(buildingGltf.extras.heightMeters.distinct > 600);
      assert.notEqual(buildingGltf.extras.heightMeters.min, buildingGltf.extras.heightMeters.max);
    }

    for (const chunk of manifest.chunks) {
      assert.equal(chunk.status, "ready");
      assert.match(chunk.url, /^\/assets\/scenes\/.+\.glb$/);
      const bytes = await fs.readFile(path.join(publicDir, chunk.url));
      assert.ok(bytes.byteLength > 20, `${chunk.id} is empty`);
      assert.equal(bytes.subarray(0, 4).toString("ascii"), "glTF", `${chunk.id} is not GLB`);
      assert.equal(bytes.readUInt32LE(4), 2, `${chunk.id} is not glTF 2`);
    }

    if (manifest.particle_boundary.url) {
      const boundary = JSON.parse(await fs.readFile(path.join(publicDir, manifest.particle_boundary.url), "utf8"));
      assert.equal(boundary.role, "particle-boundary");
      assert.equal(boundary.status, "ready");
    }
  });
}
