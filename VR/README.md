# PHI WebXR — Local Edition

Local WebXR reconstruction of the Rhino + Grasshopper + Enscape project, with Concord School and South Park scenes.

## Start

On macOS, double-click `Start PHI WebXR.command`. It builds the current project, starts the local server, and opens:

`http://localhost:3000`

Keep the Terminal window open while using the experience. Press `Control-C` in that window to stop it.

Command-line alternative:

```bash
pnpm install
pnpm run build
pnpm run start -- --hostname 127.0.0.1 --port 3000
```

## Checks

```bash
pnpm run data:check
pnpm run scene:audit
pnpm run test
pnpm run typecheck
pnpm run lint
pnpm run build
```

## Included

- Concord School and a complete South Park GLB scene with restored GIS ground and road surfaces
- Full 7,791-row Excel series embedded directly in TypeScript (no runtime Excel/JSON request)
- Original six-zone Concord instanced mesh-sphere profile and South Park 8px soft Cloud Display particles constrained to the restored road network
- Hourly PM2.5/wind forcing with continuous road-safe particle substeps and render interpolation
- Full historical date/hour playback, wind and sunlight
- Simplified right sidebar, collapsed mobile bottom panel, and complete chapter-based guided narration controls
- Desktop navigation plus WebXR joystick movement, snap turn and controller teleportation
- VR status HUD, narration audio and offline heavy-asset cache

## Project structure

```text
app/components/   Interface and Three.js/WebXR scene components
app/data/         Embedded air-quality data, scene manifests and tour content
app/lib/          Particle physics, tour state and shared types
public/assets/    Runtime scene models, colliders and particle boundaries
scripts/data/     Excel conversion and validation tools
scripts/assets/   GLB conversion and scene auditing tools
tests/            Automated regression tests
reports/          Generated non-runtime audit reports
docs/             Handover and migration notes
```

## Rhino material export

The Concord export preserves object materials inside layers and nested blocks instead of assigning one material per layer name. The source 3DM remains read-only.

```bash
PYTHONPATH=/path/to/rhino3dm python3 scripts/assets/audit-rhino-materials.py \
  "/Users/paul/Desktop/vr/01_Rhino模型/学校场景/主模型/Concord International School.3dm" \
  reports/rhino-material-audit.json
PYTHONPATH=/path/to/rhino3dm python3 scripts/assets/export-rhino-mesh-materials.py \
  "/Users/paul/Desktop/vr/01_Rhino模型/学校场景/主模型/Concord International School.3dm" \
  .artifact-runtime/rhino-material-obj
```

Breps with per-object materials are exported read-only through RhinoCode using `scripts/assets/export-rhino-brep-materials.py`. See [`docs/rhino-material-export.md`](docs/rhino-material-export.md) for the resolved material map and intentional exclusions.

## Hardware note

Desktop mode works at `localhost`. A standalone Quest cannot use the Mac's `localhost`; Quest testing over the local network still requires a trusted HTTPS address or a USB debugging tunnel. The remaining device-side checks are listed in [`docs/migration-status.md`](docs/migration-status.md).
