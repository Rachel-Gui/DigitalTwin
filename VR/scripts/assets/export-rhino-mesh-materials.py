#!/usr/bin/env python3
"""Expand selected Rhino block meshes into material-specific OBJ sources.

This keeps nested block layers from disappearing into the material of their
parent export. Rhino is never opened for editing; rhino3dm reads the 3DM and the
instance transforms are applied to duplicated meshes in memory.
"""

import argparse
from collections import defaultdict
from pathlib import Path

try:
    import rhino3dm
except ImportError as error:
    raise SystemExit("Install rhino3dm or add it to PYTHONPATH before running this exporter") from error


ROUTES = {
    "C-TOPO::A-GLAZ-CURT": "CURTAIN_GLASS",
    "C-TOPO::A-GLAZ-CWMG": "CURTAIN_FRAME",
    "GLASS::A-DOOR-GLAZ": "DOOR_GLAZING",
    "楼梯上的石头": "STAIR_CONCRETE",
}


def material_name(model, layer, attributes):
    if attributes.MaterialSource == rhino3dm.ObjectMaterialSource.MaterialFromObject:
        index = attributes.MaterialIndex
    else:
        index = layer.RenderMaterialIndex
    return model.Materials[index].Name if 0 <= index < len(model.Materials) else "(unassigned)"


parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("output_dir", type=Path)
parser.add_argument("--prefix", default="school_core")
args = parser.parse_args()

model = rhino3dm.File3dm.Read(str(args.source))
if model is None:
    raise SystemExit(f"Could not read {args.source}")

meshes = defaultdict(list)


def collect(obj, transform):
    geometry = obj.Geometry
    if type(geometry).__name__ == "InstanceReference":
        definition = model.InstanceDefinitions.FindId(geometry.ParentIdefId)
        if definition is None:
            return
        nested_transform = rhino3dm.Transform.Multiply(transform, geometry.Xform)
        for object_id in definition.GetObjectIds():
            collect(model.Objects.FindId(object_id), nested_transform)
        return

    if type(geometry).__name__ != "Mesh":
        return
    layer = model.Layers[obj.Attributes.LayerIndex]
    route = ROUTES.get(layer.FullPath)
    if layer.FullPath == "GLASS::A-DOOR-FRAM" and material_name(model, layer, obj.Attributes) == "石膏 (12)":
        route = "DOOR_FRAME"
    if route is None:
        return
    mesh = geometry.Duplicate()
    mesh.Transform(transform)
    meshes[route].append(mesh)


for source_object in model.Objects:
    if not source_object.Attributes.IsInstanceDefinitionObject:
        collect(source_object, rhino3dm.Transform.Identity())

args.output_dir.mkdir(parents=True, exist_ok=True)
for route, route_meshes in sorted(meshes.items()):
    target = args.output_dir / f"{args.prefix}__{route}.obj"
    lines = ["# Expanded read-only Rhino material export", f"usemtl {route}"]
    vertex_offset = 1
    for mesh in route_meshes:
        vertices = list(mesh.Vertices)
        normals = list(mesh.Normals)
        lines.extend(f"v {point.X * 1000:.9f} {point.Y * 1000:.9f} {point.Z * 1000:.9f}" for point in vertices)
        if len(normals) == len(vertices):
            lines.extend(f"vn {normal.X:.9f} {normal.Y:.9f} {normal.Z:.9f}" for normal in normals)
        else:
            lines.extend("vn 0 0 1" for _ in vertices)
        for face in mesh.Faces:
            indices = list(face)
            if indices[2] == indices[3]:
                indices = indices[:3]
            lines.append("f " + " ".join(f"{vertex_offset + index}//{vertex_offset + index}" for index in indices))
        vertex_offset += len(vertices)
    target.write_text("\n".join(lines) + "\n")
    print(f"{target.name}: {len(route_meshes)} expanded meshes")
