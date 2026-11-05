// Verify and combine the exact published visual assets. Existing VR dependencies are used only for this offline build.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as THREE from '../../../../VR/node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../../../VR/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from '../../../../VR/node_modules/three/examples/jsm/exporters/GLTFExporter.js';
const base=new URL('../',import.meta.url),manifest=JSON.parse(await fs.readFile(new URL('data/original/manifest.json',base),'utf8'));
const originalManifest=JSON.parse(await fs.readFile(new URL('../../../../VR/public/runtime-assets/south-park-scene-manifest.json',import.meta.url),'utf8'));
assert.deepEqual(manifest,originalManifest);
const group=new THREE.Group(),loader=new GLTFLoader(),checks=[];let triangles=0;
for(const chunk of manifest.chunks.filter(c=>c.role==='visual')){
 const name=chunk.url.split('/').at(-1),path=new URL('data/original/'+name,base),bytes=await fs.readFile(path);
 const original=await fs.readFile(new URL('../../../../VR/public'+chunk.url,import.meta.url));assert.ok(bytes.equals(original),'Published asset differs from local source: '+name);
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 gltf.scene.name=chunk.id;gltf.scene.traverse(object=>{if(!object.isMesh)return;const p=object.geometry.attributes.position;for(const value of p.array)assert.ok(Number.isFinite(value));triangles+=(object.geometry.index?object.geometry.index.count:p.count)/3;});group.add(gltf.scene);
 checks.push({asset:name,source:'https://decarb-city-twin-vr.ruichg.chatgpt.site'+chunk.url,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,identical_to_repository:true});
}
const box=new THREE.Box3().setFromObject(group);assert.ok(!box.isEmpty());
group.name='South Park - original published geometry';group.userData={source:manifest.source,reference:'https://decarb-city-twin-vr.ruichg.chatgpt.site/#south-park',coordinate_system:manifest.coordinate_system,runtime:manifest.runtime,building_count:1432,height_source:'Original Grasshopper Height field',assets:checks};
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}};
const data=await new GLTFExporter().parseAsync(group,{binary:true}),bytes=Buffer.from(data);assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(8),bytes.length);
const roundtrip=await loader.parseAsync(data,'');const roundtripBox=new THREE.Box3().setFromObject(roundtrip.scene);const boundsError=Math.max(box.min.distanceTo(roundtripBox.min),box.max.distanceTo(roundtripBox.max));console.log('GLB roundtrip bounds error (m):',boundsError);assert.ok(boundsError<0.001,'Export changed bounds by more than 1 mm');
await fs.writeFile(new URL('data/south-park-original-city.glb',base),bytes);
await fs.writeFile(new URL('data/original/verified-assets.json',base),JSON.stringify({verified_date:'2026-11-05',assets:checks,triangles,bounds:{min:box.min.toArray(),max:box.max.toArray()}},null,2));
console.log(JSON.stringify({checks:'Published models match repository byte for byte; finite geometry, GLB load/export/reload and unchanged bounds: PASS',triangles,glbBytes:bytes.length}));
