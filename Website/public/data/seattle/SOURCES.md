# Seattle homepage scene

Retrieved 2026-11-12.

- Building footprints: City of Seattle, Building Outlines 2023. https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/Building_Outlines_2023/FeatureServer/0
- Roads: Seattle Downtown Features, layer 2. https://services2.arcgis.com/ZQgQTuoyBrtmoGdP/ArcGIS/rest/services/Seattle_Downtown_Features/FeatureServer/2
- Bounding box: west -122.360, south 47.596, east -122.325, north 47.626 (WGS84).
- 1,515 building polygons and 268 road geometries. Coordinates rounded to six decimal places; footprint query simplified at 0.000012 degrees.
- Local scene projection uses a fixed longitude/latitude-to-metre approximation around [-122.341, 47.611], appropriate for a visual presentation.
- Footprint source contains no height attribute. Building massing heights are deterministic illustrative values, with simplified landmark massing. The Space Needle is a manually modeled landmark at its approximate location. These are not surveyed 3D models.
- Shoreline is simplified manually for the presentation. Heat, solar, and air palette views use procedural illustration, not measured or validated simulation data. No numeric environmental results are presented.
- Three.js and its addons are reused from the existing project's public/south-park-model/vendor directory; see its LICENSE.
- Visual direction inspired by https://infrared.city/; no reference-site code, models, or imagery are included in the implementation.
