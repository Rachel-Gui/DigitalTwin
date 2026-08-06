#!/usr/bin/env python3
import json, math, struct, sys
from pathlib import Path

ORIGIN = (6059186.222463267, 4361765.752099738, 995526.8058669392)  # Rhino mm
COLORS = {
    "school_core": (0.72, 0.55, 0.38, 1.0),
    "school_buildings": (0.58, 0.48, 0.40, 1.0),
    "school_context": (0.35, 0.48, 0.30, 1.0),
    "school_vegetation": (0.18, 0.45, 0.16, 1.0),
    "school_colliders": (0.20, 0.55, 0.80, 0.25),
}

def pad4(data: bytes, fill=b"\0") -> bytes:
    return data + fill * ((-len(data)) % 4)

def convert(path: Path):
    src_v, src_n, verts, norms, indices, lookup = [], [], [], [], [], {}
    for line in path.read_text(errors="replace").splitlines():
        p = line.split()
        if not p: continue
        if p[0] == "v": src_v.append(tuple(map(float, p[1:4])))
        elif p[0] == "vn": src_n.append(tuple(map(float, p[1:4])))
        elif p[0] == "f":
            face = []
            for token in p[1:]:
                q = token.split("/"); vi = int(q[0]); ni = int(q[2]) if len(q) > 2 and q[2] else 0
                key = (vi, ni)
                if key not in lookup:
                    x,y,z = src_v[vi-1]
                    verts.append(((x-ORIGIN[0])*0.001, (z-ORIGIN[2])*0.001, -(y-ORIGIN[1])*0.001))
                    if ni:
                        x,y,z = src_n[ni-1]; norms.append((x,z,-y))
                    else: norms.append((0.0,1.0,0.0))
                    lookup[key] = len(verts)-1
                face.append(lookup[key])
            for i in range(1, len(face)-1): indices += [face[0], face[i], face[i+1]]
    if not indices: raise ValueError(f"No faces: {path}")
    pos = b"".join(struct.pack("<3f", *v) for v in verts)
    nor = b"".join(struct.pack("<3f", *v) for v in norms)
    use_u32 = len(verts) > 65535
    ind = b"".join(struct.pack("<I" if use_u32 else "<H", i) for i in indices)
    pos, nor, ind = pad4(pos), pad4(nor), pad4(ind)
    blob = pos + nor + ind
    mins = [min(v[i] for v in verts) for i in range(3)]
    maxs = [max(v[i] for v in verts) for i in range(3)]
    name = path.stem; color = COLORS.get(name, (0.7,0.7,0.7,1.0))
    gltf = {
      "asset":{"version":"2.0","generator":"Concord Rhino MCP OBJ-to-GLB"},
      "scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"mesh":0,"name":name}],
      "meshes":[{"name":name,"primitives":[{"attributes":{"POSITION":0,"NORMAL":1},"indices":2,"material":0}]}],
      "materials":[{"name":name,"pbrMetallicRoughness":{"baseColorFactor":color,"metallicFactor":0.0,"roughnessFactor":0.85},"alphaMode":"BLEND" if color[3] < 1 else "OPAQUE","doubleSided":True}],
      "buffers":[{"byteLength":len(blob)}],
      "bufferViews":[
        {"buffer":0,"byteOffset":0,"byteLength":len(pos),"target":34962},
        {"buffer":0,"byteOffset":len(pos),"byteLength":len(nor),"target":34962},
        {"buffer":0,"byteOffset":len(pos)+len(nor),"byteLength":len(ind),"target":34963}],
      "accessors":[
        {"bufferView":0,"componentType":5126,"count":len(verts),"type":"VEC3","min":mins,"max":maxs},
        {"bufferView":1,"componentType":5126,"count":len(norms),"type":"VEC3"},
        {"bufferView":2,"componentType":5125 if use_u32 else 5123,"count":len(indices),"type":"SCALAR","min":[min(indices)],"max":[max(indices)]}],
      "extras":{"rhinoOriginMm":ORIGIN,"coordinateSystem":"glTF Y-up meters"}}
    js = pad4(json.dumps(gltf,separators=(",",":"),ensure_ascii=False).encode(), b" ")
    total = 12 + 8 + len(js) + 8 + len(blob)
    out = struct.pack("<4sII",b"glTF",2,total)+struct.pack("<I4s",len(js),b"JSON")+js+struct.pack("<I4s",len(blob),b"BIN\0")+blob
    target = path.with_suffix(".glb"); target.write_bytes(out)
    print(f"{target.name}: {len(verts)} vertices, {len(indices)//3} triangles, {len(out)/1048576:.2f} MB, bounds={mins}..{maxs}")

for arg in sys.argv[1:]: convert(Path(arg))
