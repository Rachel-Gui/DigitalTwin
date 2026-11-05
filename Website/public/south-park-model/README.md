# South Park — original-model standalone page

Open `http://localhost:5173/south-park-model/index.html` with the existing Website development server. Existing Website pages, routes, dependency files and the VR app are unchanged.

This page replaces the earlier footprint approximation with the **exact three visual GLB files downloaded from the reference experience**:

https://decarb-city-twin-vr.ruichg.chatgpt.site/#south-park

- `south_park_buildings.glb` — original 1,432 footprints and matching Grasshopper `Height` values (6.87–30.32 m).
- `south_park_roads.glb` — original restored road surfaces.
- `south_park_ground.glb` — original restored ground surfaces.

No geometry, scale, material or placement changes are applied. The published manifest and all three downloaded models match the corresponding repository source files byte for byte. SHA-256 hashes, source URLs and model bounds are recorded in `data/original/verified-assets.json`.

The scene uses the original 58° camera, initial camera/target coordinates, scaled exponential fog, Three.js Sky settings, hemisphere and ambient lights, directional sun orbit, time-of-day formula, shadow parameters, ACES tone mapping, and orbit limits. UI tokens and the right-hand 300 px panel match the original VR experience. Camera presets, layer visibility, time of day, screenshots and model downloads work independently of the original app. The historical PM2.5 replay, road-network particle model, South Park narration chapter and WebXR entry are now ported to this page; see Reference experience below.

This model retains its original local GIS coordinate system. An EPSG definition or independent longitude/latitude registration has not been established, so the earlier unverified bounding-box controls and satellite geometry are no longer used. Source building heights are retained, but their survey accuracy and acquisition date have not been independently verified.

`data/south-park-original-city.glb` combines the three original visual assets into one downloadable model. The individual original files remain directly downloadable. The browser export button exports currently visible model layers. Sky, lighting and UI are viewer presentation, outside the geometry download.

Regenerate and verify with the existing sibling VR dependencies:

```sh
node Website/public/south-park-model/tools/build-model.mjs
```

Checks verify manifest identity, byte-identical original GLB assets, finite vertices, GLB load/export/reload, and model bounds to within 1 mm (observed roundtrip precision error: 0.000061 m). The combined model contains 70,488 triangles. Three.js is MIT licensed; see `vendor/LICENSE`.

Browser visual/interaction QA remains unavailable while the computer-use browser host is unavailable.

## Dashboard sensor observations

The right panel calls the same same-origin `/api/clarity` API as `src/hooks/useClarityData.js`. It filters locations with finite numeric latitude/longitude and sorts by the numeric name prefix, matching the Air dashboard map. The current response has 19 registered devices and 4 located/reporting sources; counts are derived dynamically. Each located source is selectable and shows PM2.5, PM10 and NO2 with per-metric timestamps, units and available QC assessment. Coordinates are displayed as metadata; no guessed 3D placement is applied to the locally coordinated Rhino model.

The API remains server-side and unchanged. No keys or cached observation fixtures are added to the page. Data loads independently of WebGL, on manual refresh and every five minutes while visible; the existing server cache remains up to 4 h 45 min. Missing values remain `—`. Errors are visible; previous successful readings, if any, are explicitly identified as retained readings. Times use America/Los_Angeles with PST/PDT labels.

## Regional cloud visualization

Default display is a large, bounded cloud layer around the entire original model extent with adjustable padding, altitude and opacity. All controls, labels and legend are English. Colors and opacity derive from inverse-distance weighted (power 2, 20 m regularization) interpolation of current in-model valid sensor measurements. Exact sensor positions retain their observed values. Point annotations show raw observations and QC states. No historical time series or physical wind simulation is fabricated.

Source-data registration matches 1,421 original building FEATURE_IDs to the public Seattle 2015 geometry, with 285 held-out controls (median 0.029 m, 95th percentile 0.114 m). 51 mismatched footprint pairs exceed 3 m and are excluded from robust training; unfiltered held-out maximum error is 86.42 m. This is alignment to the original dataset, NOT independent survey or sensor-position accuracy. Calibration coefficients and controls are retained in `data/georegistration.json` and `data/registration-controls.json`.

Current PM2.5 inputs include two valid in-model locations; one location has invalid QC and one lies outside the original model bounds. They remain in the sensor list but are excluded from the regional field. PM10 and NO2 use their own metric/QC states. The field is an interpolated/extrapolated estimate, not measured concentrations at every point or height. Procedural cloud shape, vertical extent and animation are illustrative. The default local color scale is computed from valid observed values and labeled numerically; a fixed concentration scale is selectable. Colors are not AQI or health categories. The sensor-network summary now uses only QC-valid PM2.5 values; the old dashboard average is not modified.

`node Website/public/south-park-model/tools/check-air-clouds.mjs` checks registration, QC, colors and IDW. Its current API check reads the development response at `/tmp/sp-clarity-current.json`. Native Chrome visual QA confirmed the point-cloud rendering, model, labels and invalid-QC exclusion; later regional-mode UI automation was blocked by the native computer-use pipe becoming unavailable.

## Concentration-colored flow and particles

The cloud opacity default is now 18%. Regional mode includes 90 animated line trails and up to 2,600 point sprites, with adjustable speed (zero pauses) and separate visibility toggles. The cloud and motion layers import the exact same GLSL IDW concentration function and palette from `field-shader.js`; field origins, dimensions, samples and numeric color ranges are shared. Relative particle occupancy increases with normalized concentration. No valid in-model samples means no field or motion.

Paths are explicitly schematic, not measured wind or transport. Particle counts are a visual relative density, not physical particles per volume. No wind data or historical change is invented. Motion stays within the displayed regional volume and is depth-tested against the original model. Cloud noise is illustrative; the values and colors remain based on actual API inputs.

`node Website/public/south-park-model/tools/check-air-flow.mjs` checks finite geometry, shared concentration uniforms, empty-data suppression, placement bounds, speed/pause and toggles. Shader compilation and final appearance still need a browser check when native computer-use access recovers.

## Sensor navigation plan

The lower-left collapsible Sensor navigation widget follows the reference School navigation layout. It captures a 512 px orthographic plan of the unchanged city geometry, without clouds or animated overlays, using a separate scene and temporary render target. Capture restores renderer exposure, shadows and render target; no original geometry/materials are changed. The plan is generated once when all model assets are ready.

The virtual camera arrow updates at 10 Hz using the same model X/Z coordinates, with an explicit Outside plan extent state and a clamped arrow at the edge. Registered sensor positions use the same georegistration as the clouds, selected pollutant, QC states and numerical color range. Clicking an in-model sensor or its button selects the API readings and frames that sensor in the main camera. Outside-model sensors use an edge marker; selecting one changes readings only, without flying into unmodeled terrain. Click an empty point in the plan to recenter. Reset restores the exact original view. The widget defaults collapsed on small screens and uses English labels.

`node Website/public/south-park-model/tools/check-navigation.mjs` validates plan/world roundtrips, outside/clamping behavior, camera headings and all four API sensor placements. Native browser interaction checks remain unavailable while the computer-use pipe is unavailable.

## Reduced scene overlays

Animated line trails are disabled and their control removed. Particle motion and the translucent cloud remain. Sensor leader lines are removed, and display-extent outlines default off. Scene labels are compact name-only tags near the sensor markers; selecting them shows detailed measurements in the existing sensor panel. Tooltips/accessible labels retain the pollutant value and QC context. A Show sensor labels checkbox can hide the tags entirely. Saved scene images use the same compact tags.


## Reference experience

The page defaults to **Latest sensor observations**, retaining the original regional gas cloud and concentration particles. The AIR EXPERIENCE selector optionally opens **Historical PM2.5 replay · reference**, preserving the cloud/particle/label settings for switching back. Live field controls and legends are hidden during historical replay to avoid mixing their meanings.

Ported from the sibling `VR/app` implementation:

- All 7,791 historical hourly records, date selector, 1.8-second hourly playback, sun timeline and synchronized sky lighting.
- Daily mean/peak, PM2.5 trend, reference lines at 9/35 µg/m³, six-band AQI scale, wind speed/direction, source metadata and timestamps. Only complete 00:00–23:00 days receive daily AQI and 24-hour reference comparisons. Concentration is truncated to one decimal before AQI interpolation.
- Original road-network boundary, source points, particle count/color functions, initialization, stochastic integration and interpolation. Missing or zero wind pauses motion; the particle display remains a symbolic model.
- Original audio file, starting at the South Park chapter (280.5–406.152 seconds), seek/play/pause/restart, transcript and resume-guide synchronization to 2025-01-29. Manual date/hour changes detach guide synchronization. The preceding Concord chapter is outside this South Park page.
- WebXR support detection, entry/exit with camera restoration, manifest XR start position and thumbstick movement/turning. Unsupported browsers show an explicit status. Actual headset behavior requires hardware verification.

Reference-specific source modules/data are in `reference/`; `reference-experience.js` connects them to the standalone viewer. Original GLB geometry and the live API are unchanged. No third-party runtime or remote iframe is introduced.

Verification:

```sh
node --experimental-loader ./Website/public/south-park-model/tools/reference-test-loader.mjs ./Website/public/south-park-model/tools/check-reference-experience.mjs
```

The check covers all historical days (324 complete, one incomplete), DOM targets, real Three.js particle geometry, live/history visibility and settings restoration, replay advancement, narration synchronization/seek/detach/resume, and the unsupported-WebXR fallback using a minimal DOM harness. It does not substitute for visual browser or headset QA. The browser access host was unavailable during this update.
