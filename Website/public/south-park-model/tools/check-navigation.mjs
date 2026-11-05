import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {planExtent,planPoint,planWorld,cameraHeading} from '../navigation-data.js';
import {geoToModel,inModelBounds} from '../cloud-data.js';
const base=new URL('../',import.meta.url),{bounds}=JSON.parse(await fs.readFile(new URL('data/original/verified-assets.json',base),'utf8')),extent=planExtent(bounds);
for(const x of [bounds.min[0],0,bounds.max[0]])for(const z of [bounds.min[2],0,bounds.max[2]]){const p=planPoint(x,z,extent);assert.equal(p.outside,false);const back=planWorld(p.x,p.y,extent);assert.ok(Math.hypot(back[0]-x,back[1]-z)<1e-8);}
const outside=planPoint(extent.minX-100,extent.minZ-100,extent);assert.equal(outside.outside,true);assert.equal(outside.displayX,10);assert.equal(outside.displayY,10);assert.ok(outside.x<0&&outside.y<0);
assert.equal(cameraHeading(0,-1),0);assert.equal(cameraHeading(1,0),90);assert.equal(cameraHeading(0,1),180);assert.equal(cameraHeading(-1,0),-90);
const registration=JSON.parse(await fs.readFile(new URL('data/georegistration.json',base),'utf8')),snapshot=JSON.parse(await fs.readFile('/tmp/sp-clarity-current.json','utf8'));
const points=snapshot.sources.filter(s=>Number.isFinite(s.latitude)&&Number.isFinite(s.longitude)).map(s=>{const p=geoToModel(s.latitude,s.longitude,registration);return {id:s.datasourceId,insideModel:inModelBounds(p,bounds),point:planPoint(...p,extent)};});
assert.equal(points.length,4);assert.equal(points.filter(p=>p.insideModel).length,3);assert.equal(points.filter(p=>p.point.outside).length,1);
console.log('Navigation: plan roundtrip, bounds, edge markers, all four camera headings, actual sensor registration and outside-model handling: PASS');
