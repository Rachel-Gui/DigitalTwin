// Rebuild the homepage mesh after editing downtown.json; no browser triangulation needed.
import * as THREE from '../public/south-park-model/vendor/three.module.js';
import { readFile, writeFile } from 'node:fs/promises';
const vendor = new URL('../public/south-park-model/vendor/three.module.js', import.meta.url).href;
const utils = (await readFile(new URL('../public/south-park-model/vendor/BufferGeometryUtils.js', import.meta.url),'utf8')).replace("from 'three'",`from '${vendor}'`);
const { mergeGeometries, mergeVertices } = await import(`data:text/javascript;base64,${Buffer.from(utils).toString('base64')}`);
const data = JSON.parse(await readFile(new URL('../public/data/seattle/downtown.json',import.meta.url),'utf8'));
const geometries=[];
const origin = [-122.341, 47.611];
const point = ([lon,lat]) => [(lon-origin[0])*75040, -(lat-origin[1])*111195];
function footprint(rings,height,color){
 const path = ring => ring.map(c=>{const [x,z]=point(c);return new THREE.Vector2(x,-z);});
 const shape = new THREE.Shape(path(rings[0]));
 for(const ring of rings.slice(1))shape.holes.push(new THREE.Path(path(ring)));
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1,curveSegments:1});
 geometry.rotateX(-Math.PI/2);
 const c=new THREE.Color(color), colors=new Float32Array(geometry.attributes.position.count*3);
 for(let i=0;i<geometry.attributes.position.count;i++)c.toArray(colors,i*3);
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));return geometry;
}
 for(const building of data.buildings){
  const ring=building.rings[0],c=ring.reduce((a,p)=>[a[0]+p[0]/ring.length,a[1]+p[1]/ring.length],[0,0]);
  const [x,z]=point(c);const seed=Math.abs(Math.sin(building.id*12.9898)*43758.5453)%1;
  const center=Math.exp(-((x-360)**2+(z-240)**2)/600000);
  let h=7+seed*25+Math.pow(seed,4)*center*185;
  if(building.height)h=building.height;
  if(Math.hypot(c[0]+122.3305,(c[1]-47.6045)*1.48)<.00038)h=284;
  if(Math.hypot(c[0]+122.3358,(c[1]-47.6108)*1.48)<.00035)h=220;
  const color=new THREE.Color().setHSL(.47+seed*.018,.23+seed*.08,.36+seed*.13);
  const g=footprint(building.rings,h,color);geometries.push(g);
 }
 const merged=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();

merged.deleteAttribute('uv');
const indexed = mergeVertices(merged);
const attributes = ['position','normal','color'];
const chunks=[],layout={};let offset=0;
for(const name of attributes){const a=indexed.getAttribute(name);const array=name==='normal'?Int8Array.from(a.array,v=>Math.round(v*127)):name==='color'?Uint8Array.from(a.array,v=>Math.round(v*255)):a.array;const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);layout[name]={offset,length:array.length,itemSize:a.itemSize,type:array.constructor.name,normalized:name!=='position'};chunks.push(bytes);offset+=bytes.length;}
const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
const index = new Uint32Array(indexed.index.array);layout.index={offset,length:index.length};chunks.push(Buffer.from(index.buffer));
await writeFile(new URL('../public/data/seattle/buildings.bin',import.meta.url),Buffer.concat(chunks));
await writeFile(new URL('../public/data/seattle/buildings-layout.json',import.meta.url),JSON.stringify(layout));
console.log(JSON.stringify({triangles:index.length/3,vertices:indexed.attributes.position.count,unindexedVertices:merged.attributes.position.count,bytes:offset+index.byteLength}));
