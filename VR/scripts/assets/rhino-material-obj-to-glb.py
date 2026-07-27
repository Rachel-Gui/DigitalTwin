#!/usr/bin/env python3
import glob, io, json, struct, sys
from pathlib import Path
from PIL import Image

ORIGIN=(6059186.222463267,4361765.752099738,995526.8058669392)
TEX=Path('/Users/paul/Desktop/vr/01_Rhino模型/学校场景/主模型/Concord International School_embedded_files')
CFG={
 'A-WALL':('Brick 01',(1,1,1,1),'Brick_01_Albedo_1k.png','Brick_01_Normal_1k.png','Brick_01_Roughness_1k.png',2.0),
 'A-DOOR':('Door glass',(0.30,0.52,0.62,.30),None,None,None,2.0),
 'A-ROOF':('Roof',(0.28,0.27,0.27,1),None,None,None,4.0),
 'A-GENM':('Concrete trim',(1,1,1,1),'Concrete_01_albedo_1K.png','Concrete_01_normal_1K.png','Concrete_01_roughness_1K.png',3.0),
 'GLASS':('Glass',(0.35,0.65,0.78,.32),None,None,None,2.0),
 'CURTAIN_GLASS':('Curtain glass',(0.30,0.58,0.70,.28),None,None,None,2.0),
 'DOOR_GLAZING':('Door glass',(0.30,0.52,0.62,.30),None,None,None,2.0),
 'CURTAIN_FRAME':('Curtain frame',(0.19,0.22,0.23,1),None,None,None,2.0),
 'DOOR_FRAME':('Door frame',(0.16,0.18,0.19,1),None,None,None,2.0),
 'CANOPY_SUPPORTS':('Canopy supports',(0.24,0.27,0.28,1),None,None,None,2.0),
 'CANOPY_ROOF':('Canopy roof',(0.72,0.72,0.69,1),None,None,None,3.0),
 'GROUND_GRASS':('Ground grass',(1,1,1,1),'Grass_04_albedo_1k.png',None,None,5.0),
 'GROUND_ASPHALT':('Ground asphalt',(1,1,1,1),'Road_10_Albedo_1k.png','Road_10_Normal_1k.png','Road_10_Roughness_1k.png',2.0),
 'GROUND_PAVING_MAIN':('Ground grass',(1,1,1,1),'Grass_04_albedo_1k.png',None,None,5.0),
 'GROUND_PAVING_DETAIL':('Ground grass',(1,1,1,1),'Grass_04_albedo_1k.png',None,None,5.0),
 'GROUND_PAVING':('Ground grass',(1,1,1,1),'Grass_04_albedo_1k.png',None,None,5.0),
 'S-BEAM':('Steel',(0.18,0.18,0.19,1),None,None,None,2.0),
 'S-BEAM_A-FLOR-HRAL':('Steel',(0.18,0.18,0.19,1),None,None,None,2.0),
 'S-STRS':('Concrete',(1,1,1,1),'Concrete_01_albedo_1K.png','Concrete_01_normal_1K.png','Concrete_01_roughness_1K.png',3.0),
 'STAIR_CONCRETE':('Stair concrete',(1,1,1,1),'Concrete_01_albedo_1K.png','Concrete_01_normal_1K.png','Concrete_01_roughness_1K.png',3.0),
 'STAIR_STONE':('Stair stone',(0.48,0.42,0.36,1),None,None,None,2.0),
 'model':('Model',(0.42,0.42,0.42,1),None,None,None,3.0),
 'C-TOPO':('Grass 04',(1,1,1,1),'Grass_04_albedo_1k.png',None,None,5.0),
 'C-PRKG':('Asphalt',(1,1,1,1),'Road_04_Albedo_1k.png',None,'Road_04_Roughness_1k.png',2.0),
 'Crosswalk':('Crosswalk',(0.92,0.92,0.9,1),None,None,None,3.0),
 '外部地板':('Warm concrete',(0.86,0.82,0.75,1),'Concrete_01_albedo_1K.png','Concrete_01_normal_1K.png','Concrete_01_roughness_1K.png',4.0),
 'PLANT':('Plant canopy',(0.32,0.52,0.22,1),None,None,None,3.0),
 'VEHICLES':('Vehicle neutral grey',(0.38,0.40,0.42,1),None,None,None,3.0),
 'COLLIDER':('Collider',(0.2,0.55,0.8,.2),None,None,None,10.0),
}

def pad(b,fill=b'\0'): return b+fill*((-len(b))%4)
def parse_obj(path,repeat,surface_seen,preconverted=False):
 v,n,outv,outn,uv,idx,seen=[],[],[],[],[],[],{}
 for line in path.read_text(errors='replace').splitlines():
  p=line.split()
  if not p: continue
  if p[0]=='v': v.append(tuple(map(float,p[1:4])))
  elif p[0]=='vn': n.append(tuple(map(float,p[1:4])))
  elif p[0]=='f':
   face=[]
   for token in p[1:]:
    q=token.split('/'); vi=int(q[0]); ni=int(q[2]) if len(q)>2 and q[2] else 0; key=(vi,ni)
    if key not in seen:
     x,y,z=v[vi-1]; nx,ny,nz=n[ni-1] if ni else (0,0,1)
     if preconverted:
      # Rhino's exploded Enscape proxy export is already X,Z,-Y. Re-applying
      # the regular Rhino-to-glTF axis conversion puts it kilometres away.
      outv.append(((x-ORIGIN[0])*.001,(y-ORIGIN[2])*.001,(z+ORIGIN[1])*.001))
      outn.append((nx,ny,nz))
      if abs(ny)>=abs(nx) and abs(ny)>=abs(nz): t=((x-ORIGIN[0])/1000/repeat,(z+ORIGIN[1])/1000/repeat)
      elif abs(nx)>=abs(nz): t=((z+ORIGIN[1])/1000/repeat,(y-ORIGIN[2])/1000/repeat)
      else: t=((x-ORIGIN[0])/1000/repeat,(y-ORIGIN[2])/1000/repeat)
     else:
      outv.append(((x-ORIGIN[0])*.001,(z-ORIGIN[2])*.001,-(y-ORIGIN[1])*.001))
      outn.append((nx,nz,-ny))
      if abs(nz)>=abs(nx) and abs(nz)>=abs(ny): t=((x-ORIGIN[0])/1000/repeat,(y-ORIGIN[1])/1000/repeat)
      elif abs(nx)>=abs(ny): t=((y-ORIGIN[1])/1000/repeat,(z-ORIGIN[2])/1000/repeat)
      else: t=((x-ORIGIN[0])/1000/repeat,(z-ORIGIN[2])/1000/repeat)
     uv.append(t);seen[key]=len(outv)-1
    face.append(seen[key])
   for i in range(1,len(face)-1):
    triangle=[face[0],face[i],face[i+1]]
    signature=tuple(sorted(tuple(round(value,3) for value in outv[vertex]) for vertex in triangle))
    if signature in surface_seen: continue
    surface_seen.add(signature); idx += triangle
 return outv,outn,uv,idx

def build(prefix,srcdir,outdir):
 files=sorted(Path(srcdir).glob(prefix+'__*.obj')); blob=b''; views=[]; access=[]; prim=[]; mats=[]; images=[]; textures=[]; image_cache={}; surface_seen=set()
 def add_data(data,target):
  nonlocal blob
  off=len(blob); data=pad(data); blob+=data; views.append({'buffer':0,'byteOffset':off,'byteLength':len(data),'target':target}); return len(views)-1
 def add_image(name):
  nonlocal blob
  if not name:return None
  if name in image_cache:return image_cache[name]
  p=TEX/name
  im=Image.open(p).convert('RGB'); im.thumbnail((512,512),Image.Resampling.LANCZOS)
  encoded=io.BytesIO(); im.save(encoded,format='JPEG',quality=82,optimize=True)
  raw=pad(encoded.getvalue()); off=len(blob); blob+=raw; views.append({'buffer':0,'byteOffset':off,'byteLength':len(raw)}); images.append({'name':name,'bufferView':len(views)-1,'mimeType':'image/jpeg'}); textures.append({'source':len(images)-1,'sampler':0}); image_cache[name]=len(textures)-1; return image_cache[name]
 total_tri=0
 for path in files:
  key=path.stem.split('__',1)[1]
  if key in {'GLASS_A-DOOR-FRAM','楼梯上的石头','model'}: continue
  if key in {'GROUND_PAVING_MAIN','GROUND_PAVING_DETAIL'} and (Path(srcdir)/f'{prefix}__GROUND_PAVING.obj').exists(): continue
  cfg=CFG.get(key,(key,(.7,.7,.7,1),None,None,None,3.0)); name,color,base,normal,rough,repeat=cfg
  vv,nn,tt,ii=parse_obj(path,repeat,surface_seen,prefix in {'school_plants','school_vehicles'})
  if not ii:continue
  total_tri+=len(ii)//3; use32=len(vv)>65535
  pb=b''.join(struct.pack('<3f',*x) for x in vv); nb=b''.join(struct.pack('<3f',*x) for x in nn); tb=b''.join(struct.pack('<2f',*x) for x in tt); ib=b''.join(struct.pack('<I' if use32 else '<H',x) for x in ii)
  pi,ni,ti,xi=add_data(pb,34962),add_data(nb,34962),add_data(tb,34962),add_data(ib,34963)
  mins=[min(x[i] for x in vv) for i in range(3)]; maxs=[max(x[i] for x in vv) for i in range(3)]
  a0=len(access); access += [
   {'bufferView':pi,'componentType':5126,'count':len(vv),'type':'VEC3','min':mins,'max':maxs},
   {'bufferView':ni,'componentType':5126,'count':len(nn),'type':'VEC3'},
   {'bufferView':ti,'componentType':5126,'count':len(tt),'type':'VEC2'},
   {'bufferView':xi,'componentType':5125 if use32 else 5123,'count':len(ii),'type':'SCALAR','min':[min(ii)],'max':[max(ii)]}]
  metallic=0.46 if key in {'VEHICLES','CURTAIN_FRAME','DOOR_FRAME','CANOPY_SUPPORTS'} else 0.0
  roughness=0.38 if key=='VEHICLES' else (0.44 if key in {'CURTAIN_FRAME','DOOR_FRAME','CANOPY_SUPPORTS'} else (0.74 if key=='PLANT' else 0.82))
  pbr={'baseColorFactor':color,'metallicFactor':metallic,'roughnessFactor':roughness}; bt=add_image(base); nt=add_image(normal); rt=add_image(rough)
  if bt is not None:pbr['baseColorTexture']={'index':bt}
  if rt is not None:pbr['metallicRoughnessTexture']={'index':rt}
  mat={'name':name,'pbrMetallicRoughness':pbr,'doubleSided':True,'extras':{'sourceKey':key,'uvTileMeters':repeat}}
  if nt is not None:mat['normalTexture']={'index':nt,'scale':1.0}
  if color[3]<1:mat.update({'alphaMode':'BLEND','alphaCutoff':0.01})
  mats.append(mat);prim.append({'attributes':{'POSITION':a0,'NORMAL':a0+1,'TEXCOORD_0':a0+2},'indices':a0+3,'material':len(mats)-1})
 gltf={'asset':{'version':'2.0','generator':'Concord Rhino MCP PBR exporter'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':prefix}],'meshes':[{'name':prefix,'primitives':prim}],'materials':mats,'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],'images':images,'textures':textures,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access,'extras':{'rhinoOriginMm':ORIGIN,'coordinateSystem':'glTF Y-up meters','sourceCoordinates':'preconverted X,Z,-Y' if prefix in {'school_plants','school_vehicles'} else 'Rhino XYZ','uv':'generated planar by dominant surface normal'}}
 js=pad(json.dumps(gltf,separators=(',',':'),ensure_ascii=False).encode(),b' '); total=12+8+len(js)+8+len(blob); out=struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob
 target=Path(outdir)/(prefix+'.glb');target.write_bytes(out);print(f'{prefix}: {len(prim)} materials, {total_tri} triangles, {len(out)/1048576:.2f} MB')

src,out=sys.argv[1],sys.argv[2]
prefixes=sys.argv[3:] or ('school_core','school_buildings','school_context','school_plants','school_vehicles','school_colliders')
for p in prefixes: build(p,src,out)
