import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "public");
const reportDir = path.join(root, "reports");
const manifestPaths = ["runtime-assets/scene-manifest.json", "runtime-assets/south-park-scene-manifest.json"];

function parseGlb(bytes) {
  if (bytes.subarray(0, 4).toString("ascii") !== "glTF" || bytes.readUInt32LE(4) !== 2) {
    throw new Error("Expected a glTF 2 GLB");
  }
  const jsonLength = bytes.readUInt32LE(12);
  return JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").replace(/[\0 ]+$/, ""));
}

function primitiveTriangles(primitive, accessors) {
  const count = primitive.indices === undefined
    ? accessors[primitive.attributes?.POSITION]?.count ?? 0
    : accessors[primitive.indices]?.count ?? 0;
  const mode = primitive.mode ?? 4;
  if (mode === 4) return Math.floor(count / 3);
  if (mode === 5 || mode === 6) return Math.max(count - 2, 0);
  return 0;
}

const scenes = [];
for (const manifestPath of manifestPaths) {
  const manifest = JSON.parse(await fs.readFile(path.join(publicDir, manifestPath), "utf8"));
  if (!manifest.runtime || manifest.particle_boundary?.role !== "particle-boundary") {
    throw new Error(`${manifestPath} is missing runtime coordinates or a particle boundary role`);
  }
  let particleBoundary = manifest.particle_boundary;
  if (particleBoundary.url) {
    particleBoundary = JSON.parse(await fs.readFile(path.join(publicDir, particleBoundary.url), "utf8"));
    if (particleBoundary.role !== "particle-boundary" || particleBoundary.status !== "ready") {
      throw new Error(`${manifestPath} references an invalid particle boundary`);
    }
  }
  const chunks = [];
  for (const chunk of manifest.chunks.filter((item) => item.status === "ready" && item.url)) {
    const bytes = await fs.readFile(path.join(publicDir, chunk.url));
    const gltf = parseGlb(bytes);
    const primitives = (gltf.meshes ?? []).flatMap((mesh) => mesh.primitives ?? []);
    chunks.push({
      id: chunk.id,
      role: chunk.role,
      bytes: bytes.byteLength,
      meshes: (gltf.meshes ?? []).length,
      primitives: primitives.length,
      triangles: primitives.reduce((sum, primitive) => sum + primitiveTriangles(primitive, gltf.accessors ?? []), 0),
      materials: (gltf.materials ?? []).length,
      textures: (gltf.textures ?? []).length,
      images: (gltf.images ?? []).length,
    });
  }
  const renderChunks = chunks.filter((chunk) => chunk.role === "visual");
  scenes.push({
    scene_id: manifest.scene_id,
    manifest: `/${manifestPath}`,
    particle_boundary: particleBoundary.id,
    totals: {
      download_bytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
      render_triangles: renderChunks.reduce((sum, chunk) => sum + chunk.triangles, 0),
      render_primitives_approx_draw_calls: renderChunks.reduce((sum, chunk) => sum + chunk.primitives, 0),
      render_material_slots: renderChunks.reduce((sum, chunk) => sum + chunk.materials, 0),
    },
    chunks,
  });
}

const report = { schema_version: "1.0.0", generated_on: "2026-07-20", scenes };
await fs.mkdir(reportDir, { recursive: true });
await fs.writeFile(path.join(reportDir, "scene-assets.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Audited ${scenes.length} scenes and ${scenes.reduce((sum, scene) => sum + scene.chunks.length, 0)} GLB chunks.`);
