"""Run with RhinoCode to mesh material-specific Breps without editing the 3DM.

RhinoCommon is used because rhino3dm deliberately does not mesh Breps. Paths
are fixed to this local project so RhinoCode can run the script without CLI
arguments.
"""

from collections import defaultdict
from pathlib import Path

import Rhino


SOURCE = Path("/Users/paul/Desktop/vr/01_Rhino模型/学校场景/主模型/Concord International School.3dm")
OUTPUT = Path("/Users/paul/Desktop/vr/webxr/.artifact-runtime/rhino-material-obj")


def route_for(layer_path, material):
    if layer_path == "GLASS::A-DOOR-FRAM":
        return {
            "Grass 04": ("school_context", "GROUND_GRASS"),
            "Road 10": ("school_context", "GROUND_ASPHALT"),
            "Plastic 07, Hay": ("school_context", "GROUND_PAVING"),
        }.get(material)
    if layer_path == "楼梯上的石头" and material == "石膏 (7)":
        return "school_core", "STAIR_STONE"
    if layer_path == "model":
        return ("school_core", "CANOPY_ROOF") if material == "Plaster" else ("school_core", "CANOPY_SUPPORTS")
    return None


model = Rhino.FileIO.File3dm.Read(str(SOURCE))
if model is None:
    raise RuntimeError("Could not read source 3DM")

routes = defaultdict(list)
parameters = Rhino.Geometry.MeshingParameters.Default
for obj in model.Objects:
    if obj.Attributes.IsInstanceDefinitionObject or not isinstance(obj.Geometry, Rhino.Geometry.Brep):
        continue
    layer = model.AllLayers.FindIndex(obj.Attributes.LayerIndex)
    if obj.Attributes.MaterialSource == Rhino.DocObjects.ObjectMaterialSource.MaterialFromObject:
        material_index = obj.Attributes.MaterialIndex
    else:
        material_index = layer.RenderMaterialIndex
    material = model.AllMaterials.FindIndex(material_index).Name if material_index >= 0 else "(unassigned)"
    route = route_for(layer.FullPath, material)
    if route is None:
        continue
    for mesh in Rhino.Geometry.Mesh.CreateFromBrep(obj.Geometry, parameters) or []:
        mesh.Normals.ComputeNormals()
        routes[route].append(mesh)

OUTPUT.mkdir(parents=True, exist_ok=True)
for (prefix, key), meshes in sorted(routes.items()):
    target = OUTPUT / f"{prefix}__{key}.obj"
    lines = ["# Read-only RhinoCommon material export", f"usemtl {key}"]
    vertex_offset = 1
    for mesh in meshes:
        lines.extend(f"v {point.X * 1000:.9f} {point.Y * 1000:.9f} {point.Z * 1000:.9f}" for point in mesh.Vertices)
        lines.extend(f"vn {normal.X:.9f} {normal.Y:.9f} {normal.Z:.9f}" for normal in mesh.Normals)
        for face in mesh.Faces:
            indices = [face.A, face.B, face.C] if face.IsTriangle else [face.A, face.B, face.C, face.D]
            lines.append("f " + " ".join(f"{vertex_offset + index}//{vertex_offset + index}" for index in indices))
        vertex_offset += mesh.Vertices.Count
    target.write_text("\n".join(lines) + "\n")
    print(f"{target.name}: {len(meshes)} Brep meshes")
