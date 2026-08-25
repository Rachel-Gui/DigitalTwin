# PHI WebXR Handover

Last updated: 2026-07-20 (America/Los_Angeles)

## Goal and current direction

Continue the Rhino + Grasshopper + Enscape migration as a **local-only WebXR application**. Do not use or wait for OpenAI Sites hosting unless the user explicitly changes direction.

Product requirements already established:

- UI must be entirely English.
- Keep the interface extremely minimal; retain only essential controls and text.
- Match the original Rhino + Grasshopper + Enscape experience as closely as browser/WebXR constraints allow.
- Preserve Concord School and South Park as switchable scenes.
- Translate the existing Grasshopper particle range and behavior first; real-time data is a later phase.
- Do not use Computer Use for Rhino or webpage visual QA. Rhino/Grasshopper inspection must use Rhino MCP; the user performs final visual review.

## Project location and current revision

- WebXR app: `/Users/paul/Desktop/vr/webxr`
- Workspace root: `/Users/paul/Desktop/vr`
- Branch: `main`
- This revision started from: `a3f3c155dc7039f21493c2debb831848d2dd70dd`
- The Excel/particle/UI/XR changes described below are the current working-tree implementation.

Important recent commits:

- `f4d8277` — standalone local WebXR launcher
- `7536a6f` — Grasshopper particle parity and WebXR hardening
- `df5a6c7` — closer visual/interaction match to the Rhino prototype
- `7d2313d` — scene asset QA and production safeguards

## Start the local version

Preferred macOS method: double-click:

`/Users/paul/Desktop/vr/webxr/Start PHI WebXR.command`

It builds the app, starts the local server, and opens:

`http://localhost:3000/`

Terminal alternative:

```bash
cd /Users/paul/Desktop/vr/webxr
pnpm run build
pnpm run start -- --hostname 127.0.0.1 --port 3000
```

The app was running successfully at `http://localhost:3000/` when this document was written. Keep the server terminal open; use `Control-C` to stop it.

## Original source files

Rhino:

- Concord: `/Users/paul/Desktop/vr/01_Rhino模型/学校场景/主模型/Concord International School.3dm`
- South Park: `/Users/paul/Desktop/vr/01_Rhino模型/South_Park场景/运行模型/south park.3dm`
- South Park alternate: `/Users/paul/Desktop/vr/01_Rhino模型/South_Park场景/运行模型/south park_r7.3dm`

Grasshopper:

- Particle source: `/Users/paul/Desktop/vr/02_Grasshopper/场景与动画/particle.gh`
- Related scenes: `PHI EarthDay.gh`, `PHI T3.gh`
- Data preprocessing: `data analysis.gh`, `from shp to geo.gh`

## Implemented state

### Scenes and materials

- Concord and South Park use real exported GLB geometry.
- Concord is split into core, buildings, context, vegetation, and collider chunks.
- South Park is split into five building chunks, restored ground and road chunks, plus a collider.
- South Park now uses the 76 internalised ground surfaces and 408 internalised road surfaces recovered from `from shp to geo.gh`.
- Runtime manifests:
  - `public/assets/scene-manifest.json`
  - `public/assets/south-park-scene-manifest.json`
- Data tools are in `scripts/data/`; scene audit and conversion tools are in `scripts/assets/`.
- Intermediate Rhino-material OBJ exports remain in `.artifact-runtime/`.
- Model loader now reports real success/failure counts and does not treat invisible colliders as successful visual content.

### Particle system

South Park in `app/lib/particleModel.ts` and `app/components/SceneCanvas.tsx` follows the C# logic extracted from `particle.gh`. Its five seeds come from the original GIS/Rhino data. The particle boundary is the restored set of 408 road surfaces from `from shp to geo.gh`, treated as the 30 m road-air extrusion used by the original Grasshopper graph.

Concord intentionally uses a different model recovered from `PHI EarthDay.gh`: six deterministic Populate3D groups, their exact boxes, 24-hour count sequences, radii (0.3 / 0.01), and original dark color.

The two particle modes are a discriminated union in `app/lib/types.ts`, with centralized runtime coordinates loaded from the scene manifests.

Parity details:

- Count range: 200–2,000.
- PM reference maximum: 50.
- Count mapping uses truncation, not rounding.
- Seed height: 2–20 m.
- Initial velocity: `wind * 5`.
- Wind force: `wind * 3`.
- Velocity blend: `v * 0.8 + force * 0.2`.
- Noise in Rhino coordinates: X/Y ±0.075 and Z ±0.04.
- Three.js mapping: X/Z ±0.075 and Y ±0.04.
- Grasshopper reference integration step: `dt = 0.8`; the browser divides it into 20 road-safe substeps.
- The hourly record updates PM2.5 and wind forcing. Particle physics continues at 8 Hz between record changes, with render interpolation between substeps.
- New particles receive a random position within a 12 m source area and 0–24 warm-up substeps, preventing all particles from appearing as five stationary stacks.
- Boundary exit reverses velocity and multiplies it by `0.3`; a second guard keeps a particle at its previous valid position when a large hourly step would still end outside a narrow street corridor.
- Browser road-constrained motion tests progressively rotated/scaled candidate velocity directions when the wind step crosses a road edge, allowing particles to follow the street corridor instead of collecting against the boundary.
- Wind maps Rhino XY to Three.js XZ as `wind_u`, `-wind_v`.
- PM color endpoints follow the Grasshopper formula.
- South Park creates one random simulation seed per experience; tests inject deterministic random sources.
- South Park uses a soft 8 px point sprite. Concord uses six opaque instanced mesh-sphere groups with the original Alpha-255 color and 0.3 m / 0.01 m radii.

The missing `roads.geojson` is reconstructed from internalised Grasshopper geometry. `public/assets/boundaries/south-park-road-volume.json` stores all 408 road polygons and their 30 m extrusion. A 4 m alignment tolerance reconciles the five original seed points with the recovered road-surface dataset; the broad four-edge CFD polygon is retained only as provenance and is no longer used at runtime.

### Embedded Excel data

- The desktop original and repository Excel files have the same SHA-256: `80ea76c9f2ba4770d10339bbadd6f5302c23e4c987f3ada928cecd8cbe75f756`.
- All 7,791 hourly rows (325 days) are generated into `app/data/airQualityData.ts` and bundled as code.
- Runtime no longer fetches `/data/*.json`; `scripts/data/convert-air-quality.mjs` is the reproducible development-time generator only.
- Blank Excel wind cells remain `null` instead of being incorrectly converted to zero.

### WebXR

- Desktop orbit navigation is working.
- WebXR entry button is present when supported.
- Each scene has a configured XR start position.
- Session start places the user at human height (1.6 m).
- Session end restores the desktop camera and target.
- Controller ray teleportation is implemented.
- Thumbstick locomotion and right-stick 30° snap turning are implemented.
- Repeated teleport offset was fixed by using headset world position.
- VR-only HUD shows scene, PM2.5 Concentration (µg/m³), hour, wind, and narration status.
- Controller lines and HUD resources are disposed correctly.
- Narration remains outside the scene canvas and survives scene/XR transitions. It provides user-started play/pause, progress, restart, chapter jump, manual detach, resume synchronization, and collapsible English transcript controls.
- Guided playback synchronizes the hour and switches Concord → South Park at 04:40.5, resetting the second chapter to 00:00.
- Mobile uses a default-collapsed bottom control panel; desktop uses a fixed 300 px right sidebar. Hidden mobile controls are inert so keyboard focus cannot enter the off-screen panel.

### Offline/cache behavior

`public/sw.js` uses:

- network-first for the page shell and application code;
- cache-first for GLB and audio assets;
- only successful HTTP responses are cached;
- offline navigation fallback;
- cache version `phi-webxr-v7`, including the particle-boundary asset.

This avoids an old service worker indefinitely serving a stale UI.

## Validation already completed

The current non-visual checks passed:

- 26 automated tests.
- Full-series deterministic particle stress audit across all 7,791 embedded hours: all five seeds inside the CFD volume, target counts within 200–2,000, and no non-finite positions or velocities.
- Data contract check.
- Scene asset audit.
- TypeScript typecheck.
- ESLint.
- Production build.

Per user instruction, no browser/Computer Use visual inspection was performed for this revision. The user will manually review the built interface and scene appearance.

Run checks with:

```bash
pnpm run data:check
pnpm run scene:audit
pnpm run test
pnpm run typecheck
pnpm run lint
pnpm run build
```

The only build notice was a nonfatal JavaScript chunk-size warning above 500 kB.

## Remaining work requiring human input or hardware

1. Test on the actual Quest headset:
   - enter/exit immersive VR;
   - controller mapping;
   - teleport comfort and approved landing zones;
   - VR HUD readability;
   - material and particle appearance;
   - sustained 72 FPS and thermal throttling.
2. Record the original Enscape/Grasshopper Golden Demo on the Windows machine.
3. Perform side-by-side visual sign-off against that recording.
4. Confirm whether numeric zero wind means real calm conditions or preprocessing output; blank wind cells are already kept distinct as `null`.
5. Decide later whether to add real-time sensor/API data.

Quest note: a standalone Quest cannot access the Mac's `localhost`. Local-network headset testing requires a trusted HTTPS address or a USB debugging tunnel. Desktop mode works directly on the Mac at `localhost`.

## Key files for the next session

- `app/components/PhiExperience.tsx` — minimal UI, scene selection, playback state.
- `app/components/SceneCanvas.tsx` — Three.js scenes, particles, model loading, XR and teleportation.
- `app/lib/particleModel.ts` — extracted/testable Grasshopper particle formulas.
- `app/data/experienceData.ts` — recovered Concord groups, South Park seeds, and embedded data access.
- `app/data/sceneConfigs.ts` — manifest-backed discriminated scene and particle configuration.
- `app/data/tourData.ts` / `app/lib/tourModel.ts` — official narration chapters, transcript, and pure guide state machine.
- `app/data/airQualityData.ts` — generated full Excel dataset committed as TypeScript code.
- `app/lib/types.ts` — shared scene/data types.
- `app/globals.css` — minimal responsive styling.
- `public/sw.js` — offline/cache policy.
- `tests/particle-model.test.mjs` — particle parity regression tests.
- `tests/scene-assets.test.mjs` — GLB/manifest validation.
- `tests/service-worker.test.mjs` — cache policy regression tests.
- `docs/migration-status.md` — detailed completion checklist.
- `README.md` — local edition instructions.

## Instructions for the next Codex conversation

- Read this document and `docs/migration-status.md` first.
- Preserve the English-only, minimal UI direction.
- Keep the project local-only unless the user explicitly requests another deployment route.
- Do not re-export models or rewrite working particle logic without a concrete reason.
- Before claiming final visual parity, require the user's desktop/Quest review and an Enscape side-by-side recording.
- Preserve unrelated user files and existing Rhino/Grasshopper sources.
