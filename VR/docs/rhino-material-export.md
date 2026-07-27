# Rhino material export decisions

The WebXR exporter treats the Rhino layer as organization, not as the final material authority. Object material, group membership, nested block layer, and instance transform are retained before GLB triangle deduplication.

| Rhino source | WebXR materials | Resolution |
|---|---|---|
| `GLASS::A-DOOR-FRAM` | Ground grass, Ground asphalt, Door frame | Grass 04 remains grass, Road 10 remains asphalt, and the former Plastic 07/Hay concrete-paving geometry is deliberately rendered as grass; the nested plaster meshes remain door frames. |
| `A-DOOR` and `GLASS::A-DOOR-GLAZ` | Door glass | The user-confirmed architectural meaning overrides the misleading Plastic 07/Hay layer assignment. |
| `C-TOPO::A-GLAZ-CURT` and `C-TOPO::A-GLAZ-CWMG` | Curtain glass, Curtain frame | Nested definition meshes are expanded through their original instance transforms. |
| `楼梯上的石头` | Stair concrete, Stair stone | Concrete meshes and plaster/stone Breps no longer share one filename-derived material. |
| `model` | Canopy supports, Canopy roof | Unassigned support Breps and the Plaster roof Brep are exported separately. |
| `PLANT` proxy instances | Plant canopy, Vehicle neutral grey | Existing Enscape proxy geometry remains the default; its preconverted X,Z,-Y coordinates are not transformed twice. |

`Default` is largely small imported detail geometry and `CFD` is analysis geometry. They are intentionally not added to the visual manifest. `A-FLOR-LEVL` contains remote instance-definition/reference data outside the campus rendering extent and is also excluded. These exclusions prevent authoring and simulation objects from being mistaken for architectural finishes.

`reports/rhino-material-audit.json` is the reproducible layer/object/group audit. The final GLB converter rejects the old merged A-DOOR-FRAM, stair, and canopy OBJ entries and removes coordinate-identical triangles across all material chunks to reduce coplanar flicker.
