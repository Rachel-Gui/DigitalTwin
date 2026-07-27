#!/usr/bin/env python3
"""Audit Rhino layers before converting them into WebXR material chunks.

The source 3DM is opened read-only. The report highlights layers that cannot be
safely mapped to one web material because their objects, groups, or child layers
retain different Rhino material sources.
"""

import argparse
from collections import Counter, defaultdict
import json
from pathlib import Path

try:
    import rhino3dm
except ImportError as error:
    raise SystemExit("Install rhino3dm or add it to PYTHONPATH before running this audit") from error


RENDERABLE = {"Brep", "Extrusion", "InstanceReference", "Mesh", "SubD"}


def material_name(model, index):
    if index is None or index < 0 or index >= len(model.Materials):
        return "(unassigned)"
    return model.Materials[index].Name or f"material-{index}"


def effective_material(model, layer, attributes):
    source = attributes.MaterialSource
    if source == rhino3dm.ObjectMaterialSource.MaterialFromObject:
        return material_name(model, attributes.MaterialIndex), "object"
    if source == rhino3dm.ObjectMaterialSource.MaterialFromLayer:
        return material_name(model, layer.RenderMaterialIndex), "layer"
    return "(inherited from instance parent)", "parent"


def bbox_values(geometry):
    box = geometry.GetBoundingBox()
    return [round(value, 6) for value in (box.Min.X, box.Min.Y, box.Min.Z, box.Max.X, box.Max.Y, box.Max.Z)]


parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("report", type=Path)
args = parser.parse_args()

model = rhino3dm.File3dm.Read(str(args.source))
if model is None:
    raise SystemExit(f"Could not read {args.source}")

layer_objects = defaultdict(list)
for obj in model.Objects:
    layer_objects[obj.Attributes.LayerIndex].append(obj)

layers = []
for layer_index, layer in enumerate(model.Layers):
    objects = layer_objects[layer_index]
    renderable = [obj for obj in objects if type(obj.Geometry).__name__ in RENDERABLE]
    material_counts = Counter()
    material_sources = Counter()
    geometry_counts = Counter()
    group_materials = defaultdict(Counter)
    definition_objects = 0
    bounds = []

    for obj in renderable:
        material, source = effective_material(model, layer, obj.Attributes)
        material_counts[material] += 1
        material_sources[source] += 1
        geometry_counts[type(obj.Geometry).__name__] += 1
        definition_objects += int(obj.Attributes.IsInstanceDefinitionObject)
        bounds.append(bbox_values(obj.Geometry))
        groups = obj.Attributes.GetGroupList() or ()
        for group_index in groups:
            group_name = model.Groups[group_index].Name or f"group-{group_index}"
            group_materials[f"{group_index}:{group_name}"][material] += 1

    distinct = [name for name, count in material_counts.items() if count]
    grouped_distinct = sorted({name for counts in group_materials.values() for name in counts})
    child_paths = [candidate.FullPath for candidate in model.Layers if candidate.ParentLayerId == layer.Id]
    risks = []
    if len(distinct) > 1:
        risks.append("multiple-object-materials")
    if len(grouped_distinct) > 1:
        risks.append("groups-retain-different-materials")
    if child_paths:
        child_materials = {
            material_name(model, candidate.RenderMaterialIndex)
            for candidate in model.Layers
            if candidate.ParentLayerId == layer.Id
        }
        if len(child_materials | set(distinct)) > 1:
            risks.append("child-layers-retain-different-materials")
    if definition_objects:
        risks.append("contains-instance-definition-geometry")

    if bounds:
        extent = [
            min(box[axis] for box in bounds) for axis in range(3)
        ] + [
            max(box[axis] for box in bounds) for axis in range(3, 6)
        ]
    else:
        extent = None

    layers.append({
        "index": layer_index,
        "path": layer.FullPath,
        "layer_material": material_name(model, layer.RenderMaterialIndex),
        "objects_total": len(objects),
        "renderable_objects": len(renderable),
        "geometry_types": dict(sorted(geometry_counts.items())),
        "materials": dict(sorted(material_counts.items())),
        "material_sources": dict(sorted(material_sources.items())),
        "groups": {name: dict(sorted(counts.items())) for name, counts in sorted(group_materials.items())},
        "child_layers": child_paths,
        "instance_definition_objects": definition_objects,
        "bounds_source_units": extent,
        "merge_risks": risks,
    })

report = {
    "schema_version": "1.0.0",
    "source": str(args.source),
    "source_open_mode": "read-only",
    "summary": {
        "layers": len(layers),
        "objects": len(model.Objects),
        "materials": len(model.Materials),
        "groups": len(model.Groups),
        "layers_with_merge_risks": sum(bool(layer["merge_risks"]) for layer in layers),
    },
    "layers": layers,
}
args.report.parent.mkdir(parents=True, exist_ok=True)
args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"Audited {len(layers)} layers; {report['summary']['layers_with_merge_risks']} require review")
