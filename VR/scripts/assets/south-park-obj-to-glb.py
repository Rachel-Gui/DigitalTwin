#!/usr/bin/env python3
import json, struct, sys
from pathlib import Path

ORIGIN=(1009500.0,-8371500.0,-100.0)
MATERIALS={
 'Plaster':('Plaster',(227/255,215/255,197/255,1)),
 'Plaster_pink':('Plaster pink',(1,.4,.4,1)),
 'Default':('Ground',(.25,.27,.28,1)),
 'Terrain':('South Park ground',(.20,.29,.23,1)),
 'Road':('South Park roads',(.105,.125,.135,1)),
 'Collider':('Collider',(.2,.55,.8,.2)),
}
def pad(b,fill=b'\0'): return b+fill*((-len(b))%4)
def parse(path):
 v,n,ov,on,uv,idx,seen=[],[],[],[],[],[],{}
 for line in path.read_text(errors='replace').splitlines():
  p=line.split()
  if not p: continue
  if p[0]=='v': v.append(tuple(map(float,p[1:4])))
  elif p[0]=='vn': n.append(tuple(map(float,p[1:4])))
  elif p[0]=='f':
   f=[]
   for token in p[1:]:
    q=token.split('/');vi=int(q[0]);ni=int(q[2]) if len(q)>2 and q[2] else 0;key=(vi,ni)
    if key not in seen:
     x,y,z=v[vi-1];nx,ny,nz=n[ni-1] if ni else (0,0,1)
     ov.append(((x-ORIGIN[0])*.001,(z-ORIGIN[2])*.001,-(y-ORIGIN[1])*.001));on.append((nx,nz,-ny));uv.append(((x-ORIGIN[0])/5000,(y-ORIGIN[1])/5000));seen[key]=len(ov)-1
    f.append(seen[key])
   for i in range(1,len(f)-1):idx += [f[0],f[i],f[i+1]]
 return ov,on,uv,idx
def build(prefix,src,out):
 files=sorted(Path(src).glob(prefix+'__*.obj'));blob=b'';views=[];acc=[];prims=[];mats=[];tri=0
 def add(data,target):
  nonlocal blob
  off=len(blob);data=pad(data);blob+=data;views.append({'buffer':0,'byteOffset':off,'byteLength':len(data),'target':target});return len(views)-1
 for path in files:
  key=path.stem.split('__',1)[1];name,color=MATERIALS.get(key,(key,(.7,.7,.7,1)));v,n,t,i=parse(path)
  if not i:continue
  tri+=len(i)//3;u32=len(v)>65535
  ids=[add(b''.join(struct.pack('<3f',*x) for x in v),34962),add(b''.join(struct.pack('<3f',*x) for x in n),34962),add(b''.join(struct.pack('<2f',*x) for x in t),34962),add(b''.join(struct.pack('<I' if u32 else '<H',x) for x in i),34963)]
  a=len(acc);acc += [{'bufferView':ids[0],'componentType':5126,'count':len(v),'type':'VEC3','min':[min(x[j] for x in v) for j in range(3)],'max':[max(x[j] for x in v) for j in range(3)]},{'bufferView':ids[1],'componentType':5126,'count':len(n),'type':'VEC3'},{'bufferView':ids[2],'componentType':5126,'count':len(t),'type':'VEC2'},{'bufferView':ids[3],'componentType':5125 if u32 else 5123,'count':len(i),'type':'SCALAR','min':[min(i)],'max':[max(i)]}]
  mat={'name':name,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':0,'roughnessFactor':.88},'doubleSided':True}
  if color[3]<1:mat['alphaMode']='BLEND'
  mats.append(mat);prims.append({'attributes':{'POSITION':a,'NORMAL':a+1,'TEXCOORD_0':a+2},'indices':a+3,'material':len(mats)-1})
 extras={'rhinoOriginMm':ORIGIN,'coordinateSystem':'glTF Y-up meters'}
 metadata=Path(src)/(prefix+'__metadata.json')
 if metadata.exists(): extras.update(json.loads(metadata.read_text()))
 g={'asset':{'version':'2.0','generator':'South Park Rhino MCP exporter'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':prefix}],'meshes':[{'name':prefix,'primitives':prims}],'materials':mats,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':acc,'extras':extras}
 js=pad(json.dumps(g,separators=(',',':')).encode(),b' ');total=12+8+len(js)+8+len(blob);raw=struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob
 target=Path(out)/(prefix+'.glb');target.write_bytes(raw);print(f'{target.name}: {len(mats)} materials, {tri} triangles, {len(raw)/1048576:.2f} MB')
src,out=sys.argv[1],sys.argv[2]
prefixes=sys.argv[3:] or (
 'south_park_t00','south_park_t01','south_park_t02','south_park_t10','south_park_t11','south_park_buildings',
 'south_park_ground','south_park_roads','south_park_colliders'
)
for p in prefixes:build(p,src,out)
