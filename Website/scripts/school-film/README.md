# School homepage film

The deployed homepage uses `public/media/concord-school-walkthrough.mp4`, a silent recording of the **actual Concord School VR interface**, not a reconstructed dashboard. Captured and delivered at the original 1920 × 940 resolution, encoded with H.264 CRF 15 without downscaling for sharper interface text and particles. The source capture limits the available detail; this is not an upscaled 4K recording.

The 24-second capture includes the original school navigation, time bar, historical-data provenance, and PM2.5 dashboard. It uses the unmodified historical profile at 07:00 (maximum ambient particle population in the existing School configuration). The values and particle mapping were not increased for dramatic effect. A temporary development-only camera path walked at pedestrian eye height along the front of the school. Original VR source files were restored after capture.

`capture-mode.patch` preserves the temporary development camera and fixed-hour setup for reproduction. `interface.html` embeds the local VR app and records that browser tab through its explicit screen-capture chooser. It sends only the selected tab to the local recorder. The stream is stopped after 24 seconds. `record.html` / `record.js` are the earlier scene-only prototype, not the delivered film.

Reproduction requires temporarily serving the capture pages under `/school-film/` from the Website dev server on `127.0.0.1:5173`, applying the development patch to the VR checkout, and running its dev server on `localhost:3000`. Select only the School capture tab in the browser's recording permission dialog. Restore the VR files after recording. No capture tools or duplicate School GLB assets are shipped in the public build.

Homepage playback: Seattle city for 16 seconds, School interface film for approximately 24 seconds, then repeat with a crossfade. While the film plays, the city renderer is suspended and marketing text fades out so it does not cover the recorded interface. Playback pauses offscreen and respects reduced-motion preferences. The homepage video has no interactive controls.
