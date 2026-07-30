#!/usr/bin/env python3
"""Split Rhino's merged A-DOOR-FRAM OBJ exports into three ground finishes.

Rhino stores the paving on one layer, but the objects retain three material/group
families: Grass 04, Road 10, and Plastic 07/Hay. The original OBJ export merged
those families. This script reconstructs the three groups by connected surface.
"""

from collections import defaultdict
from pathlib import Path
import sys


def read_obj(path: Path):
    lines = path.read_text(errors="replace").splitlines()
    vertices = [tuple(map(float, line.split()[1:4])) for line in lines if line.startswith("v ")]
    headers = [line for line in lines if not line.startswith("f ")]
    faces = []
    seen = set()
    for line in lines:
        if not line.startswith("f "):
            continue
        tokens = line.split()[1:]
        vertex_ids = [int(token.split("/")[0]) - 1 for token in tokens]
        for index in range(1, len(vertex_ids) - 1):
            triangle_ids = (vertex_ids[0], vertex_ids[index], vertex_ids[index + 1])
            signature = tuple(sorted(tuple(round(value, 3) for value in vertices[vertex_id]) for vertex_id in triangle_ids))
            if signature in seen:
                continue
            seen.add(signature)
            triangle_tokens = (tokens[0], tokens[index], tokens[index + 1])
            faces.append((triangle_ids, triangle_tokens))
    return headers, vertices, faces


def connected_components(vertices, faces):
    vertex_faces = defaultdict(list)
    for face_index, (vertex_ids, _) in enumerate(faces):
        for vertex_id in vertex_ids:
            vertex_faces[vertex_id].append(face_index)

    remaining = set(range(len(faces)))
    components = []
    while remaining:
        seed = remaining.pop()
        stack = [seed]
        component = [seed]
        coordinates = set()
        while stack:
            face_index = stack.pop()
            for vertex_id in faces[face_index][0]:
                coordinate = tuple(round(value, 3) for value in vertices[vertex_id])
                coordinates.add(coordinate)
                for neighbor in vertex_faces[vertex_id]:
                    if neighbor in remaining:
                        remaining.remove(neighbor)
                        stack.append(neighbor)
                        component.append(neighbor)
        minimum = tuple(min(point[axis] for point in coordinates) for axis in range(3))
        maximum = tuple(max(point[axis] for point in coordinates) for axis in range(3))
        area = (maximum[0] - minimum[0]) * (maximum[1] - minimum[1])
        components.append({"faces": component, "area": area})
    return components


def write_group(path: Path, headers, faces, face_ids):
    selected = set(face_ids)
    output = [*headers]
    output.extend("f " + " ".join(faces[index][1]) for index in range(len(faces)) if index in selected)
    path.write_text("\n".join(output) + "\n")


source_dir = Path(sys.argv[1])
exact_paving = source_dir / "school_context__GROUND_PAVING.obj"
if exact_paving.exists() and exact_paving.read_text(errors="replace").startswith("# Read-only RhinoCommon material export"):
    print("A-DOOR-FRAM already has exact object-material exports; fallback split skipped")
    raise SystemExit(0)
building_headers, building_vertices, building_faces = read_obj(source_dir / "school_buildings__GLASS_A-DOOR-FRAM.obj")
core_headers, core_vertices, core_faces = read_obj(source_dir / "school_core__GLASS_A-DOOR-FRAM.obj")

building_components = connected_components(building_vertices, building_faces)
largest = sorted(building_components, key=lambda component: component["area"], reverse=True)[:2]
if len(largest) != 2:
    raise RuntimeError("Expected two large ungrouped ground surfaces in A-DOOR-FRAM")

paving_component = largest[0]
asphalt_component = largest[1]
large_face_ids = set(paving_component["faces"] + asphalt_component["faces"])
grass_face_ids = [index for index in range(len(building_faces)) if index not in large_face_ids]

write_group(source_dir / "school_context__GROUND_GRASS.obj", building_headers, building_faces, grass_face_ids)
write_group(source_dir / "school_context__GROUND_ASPHALT.obj", building_headers, building_faces, asphalt_component["faces"])
write_group(source_dir / "school_context__GROUND_PAVING_MAIN.obj", building_headers, building_faces, paving_component["faces"])
write_group(source_dir / "school_context__GROUND_PAVING_DETAIL.obj", core_headers, core_faces, range(len(core_faces)))

print(
    "A-DOOR-FRAM split:",
    f"grass={len(grass_face_ids)} triangles,",
    f"asphalt={len(asphalt_component['faces'])},",
    f"paving={len(paving_component['faces']) + len(core_faces)}",
)
