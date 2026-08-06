import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const experience = await fs.readFile(new URL("../app/components/PhiExperience.tsx", import.meta.url), "utf8");
const canvas = await fs.readFile(new URL("../app/components/SceneCanvas.tsx", import.meta.url), "utf8");
const configs = await fs.readFile(new URL("../app/data/sceneConfigs.ts", import.meta.url), "utf8");
const styles = await fs.readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("application uses embedded data and discriminated scene particle configs", () => {
  assert.doesNotMatch(experience, /fetch\([^)]*data/);
  assert.match(configs, /kind: "concord-populate"/);
  assert.match(configs, /kind: "south-park-wind"/);
  assert.match(configs, /windSpeedMultiplier: 10/);
  assert.match(configs, /sizePx: 8/);
  assert.match(configs, /polygonsXZ: southParkBoundary\.polygons_xz/);
  assert.match(configs, /toleranceM: 4/);
  assert.match(configs, /simulationHz: 8/);
  assert.match(configs, /substepsPerGrasshopperStep: 20/);
  assert.match(configs, /sourceSpreadM: 12/);
  assert.match(configs, /warmupSteps: 24/);
  assert.match(configs, /color: 0x3d3535/);
  assert.match(canvas, /SphereGeometry\(group\.radius/);
  assert.match(canvas, /concordPopulateCounts\(group\.pmSeries, group\.particleRange\)/);
  assert.match(canvas, /makeSoftParticleTexture/);
  assert.doesNotMatch(experience, /RELATIVE DAILY DENSITY|Each station is normalized|Historical illustrative replay/);
  assert.match(experience, /station\.pm25\.toFixed\(2\)/);
});

test("South Park updates hourly forcing and continuously advances bounded road substeps", () => {
  assert.match(canvas, /record\.local_time === lastRecordKey/);
  assert.match(canvas, /stepSouthParkRoadParticle/);
  assert.match(canvas, /interpolatePosition/);
  assert.match(canvas, /simulationStepMs = 1000 \/ config\.motion\.simulationHz/);
  assert.match(canvas, /simulationDt = config\.integrationDt \/ config\.motion\.substepsPerGrasshopperStep/);
  assert.match(canvas, /while \(now - lastSimulationAt >= simulationStepMs && catchUpSteps < 4\)/);
  assert.match(canvas, /warmupSteps/);
  assert.match(canvas, /sourceSpreadM/);
  assert.match(experience, /getRandomValues/);
});

test("rendered Rhino ground has no procedural ground or rectangular fallback", () => {
  assert.doesNotMatch(canvas, /fallbackTeleportSurface/);
  assert.doesNotMatch(canvas, /new THREE\.PlaneGeometry\(sceneConfig/);
  assert.match(canvas, /teleportTargets\.length\) return/);
});

test("Concord spheres preserve the opaque Grasshopper colour swatch", () => {
  const concordMaterial = canvas.match(/function createConcordParticles[\s\S]*?function createSouthParkParticles/)?.[0] ?? "";
  assert.doesNotMatch(concordMaterial, /transparent:\s*true|opacity:|depthWrite:\s*false/);
});

test("Concord defaults to Enscape proxies while retaining optional replacements", () => {
  assert.match(canvas, /createConcordReplacementAssets/);
  assert.match(canvas, /replacement-\$\{key\}/);
  assert.match(canvas, /carPalette/);
  assert.match(canvas, /new Sky\(\)/);
  assert.match(canvas, /PCFSoftShadowMap/);
  assert.match(canvas, /skyUniforms\.sunPosition/);
  assert.match(canvas, /replacement_instances/);
  assert.match(canvas, /asset_mode === "realistic-replacements"/);
  assert.match(canvas, /Concrete trim/);
  assert.match(canvas, /Ground .*paving/);
  assert.match(canvas, /deciduous-tree\.glb/);
  assert.match(canvas, /MeshoptDecoder/);
});

test("South Park shares the atmospheric sky and casts city-scale building shadows", () => {
  assert.match(canvas, /const isSouthPark = sceneConfig\.id === "south-park"/);
  assert.match(canvas, /isSouthPark \? 2048 : 1024/);
  assert.match(canvas, /isSouthPark \? 3200 : 700/);
  assert.match(canvas, /isSouthPark \? 1800 : 180/);
  assert.match(canvas, /sun\.shadow\.camera\.updateProjectionMatrix\(\)/);
  assert.match(canvas, /chunk\.id === "south_park_buildings"/);
  assert.match(canvas, /object\.receiveShadow = chunk\.role === "visual"/);
});

test("XR keeps collider teleport, locomotion, snap turn, scene and narration HUD", () => {
  assert.match(canvas, /selectend/);
  assert.match(canvas, /source\.handedness !== "right"/);
  assert.match(canvas, /source\.handedness === "right"/);
  assert.match(canvas, /Math\.PI \/ 6/);
  assert.match(canvas, /sceneLabel\.toUpperCase/);
  assert.match(canvas, /Narration \$\{narrationStatus\.toUpperCase/);
});

test("loader cancellation and resource disposal prevent stale scene updates", () => {
  assert.match(canvas, /abortController\.abort/);
  assert.match(canvas, /if \(cancelled\) \{\s*disposeObject\(gltf\.scene\)/);
  assert.match(canvas, /if \(cancelled\) return;\s*failedCount/);
  assert.match(canvas, /removeEventListener\("sessionstart"/);
  assert.match(canvas, /textures\.forEach\(\(texture\) => texture\.dispose/);
});

test("mobile controls are a collapsed bottom panel by default", () => {
  assert.match(experience, /useState\(false\).*mobilePanelOpen|mobilePanelOpen.*useState\(false\)/s);
  assert.match(styles, /translateY\(calc\(100% - 62px\)\)/);
  assert.match(styles, /control-panel\.is-open \{ transform: translateY\(0\)/);
  assert.match(experience, /inert=\{mobileLayout && !mobilePanelOpen\}/);
  assert.match(experience, /aria-hidden=\{mobileLayout && !mobilePanelOpen\}/);
});
