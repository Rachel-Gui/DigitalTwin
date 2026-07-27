import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve(".asset-work/replacements");

const polyHavenAssets = [
  "island_tree_02",
  "pine_sapling_small",
  "shrub_04",
  "fern_02",
  "grass_medium_02",
  "modular_street_seating",
  "modular_chainlink_fence",
];

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function downloadPolyHaven(id) {
  const response = await fetch(`https://api.polyhaven.com/files/${id}`);
  if (!response.ok) throw new Error(`Could not read Poly Haven metadata for ${id}`);
  const files = await response.json();
  const gltf = files?.gltf?.["1k"]?.gltf;
  if (!gltf?.url || !gltf?.include) throw new Error(`No 1K glTF package for ${id}`);

  const assetRoot = path.join(outputRoot, id);
  await download(gltf.url, path.join(assetRoot, `${id}_1k.gltf`));
  for (const [relativePath, file] of Object.entries(gltf.include)) {
    await download(file.url, path.join(assetRoot, relativePath));
  }
}

await mkdir(outputRoot, { recursive: true });
for (const id of polyHavenAssets) {
  process.stdout.write(`Downloading ${id}...\n`);
  await downloadPolyHaven(id);
}

await download(
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb",
  path.join(outputRoot, "car_concept.glb"),
);

process.stdout.write(`Downloaded source assets to ${outputRoot}\n`);
