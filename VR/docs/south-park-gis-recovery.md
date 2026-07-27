# South Park GIS recovery

The visible ground, road mesh and particle road-air boundary are restored from persistent geometry embedded in:

`/Users/paul/Desktop/vr/02_Grasshopper/数据与GIS预处理/from shp to geo.gh`

The external Shapefile paths stored in that definition no longer resolve, but the Grasshopper parameters retain the source geometry:

- `footprint_internalised`: 1,432 building footprints;
- `road_surface_internalised`: 408 road surfaces;
- `groud_surface_internalised`: 76 non-road ground surfaces (the source nickname is misspelled).

The same archive also retains 15 aligned attribute branches. Branch 2 is the
original `Height` field: 1,432 positive values from 6.87 m to 30.32 m. The
building asset uses each footprint and the `Height` item at the same source
index, replacing the earlier uniform 20 m extrusion.

## Coordinate conversion

The internalised GIS geometry is in metres. The South Park Rhino model uses the same coordinates scaled to millimetres. Runtime assets use the manifest transform:

```text
Three X = GIS X - 1009.5
Three Y = GIS Z + 0.1
Three Z = -(GIS Y + 8371.5)
```

The recovered road and ground geometry is meshed in Rhino, scaled by 1,000 for the existing OBJ-to-GLB converter, and exported as:

- `public/assets/scenes/south_park_roads.glb`;
- `public/assets/scenes/south_park_ground.glb`;
- `public/assets/scenes/south_park_buildings.glb` (real per-building heights).

The road outer rings are transformed directly to Three.js coordinates and stored in:

- `public/assets/boundaries/south-park-road-volume.json`.

The runtime treats all 408 polygons as a 30 m extrusion, matching the `Brep Join → Extrude → airBrep` path in `particle.gh`. A 4 m horizontal tolerance reconciles the five original `points-sp.geojson` seeds with the recovered road-surface dataset; their offsets from the nearest road boundary range from approximately 1.6 to 3.0 m.

## Generated asset audit

The GIS recovery adds ground and roads in two draw calls and about 147 KB. The
real-height building replacement adds two material primitives and about 4.1 MB:

- ground: 1,894 triangles;
- roads: 1,406 triangles;
- buildings: 1,432 solids / 67,188 triangles;
- road boundary: 408 polygons / 2,212 vertices.

Run `pnpm scene:audit` after regenerating any scene asset, followed by the automated test and type-check commands documented in the project README.
