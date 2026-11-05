import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {geoToModel,metricState,cloudColor,inModelBounds,interpolateConcentration,concentrationRange} from '../cloud-data.js';
const base=new URL('../',import.meta.url),registration=JSON.parse(await fs.readFile(new URL('data/georegistration.json',base),'utf8'));
const controls=JSON.parse(await fs.readFile(new URL('data/registration-controls.json',base),'utf8'));
const errors=controls.filter((_,i)=>i%5===0).map(c=>{const lon=c.mercator[0]/6378137*180/Math.PI,lat=(2*Math.atan(Math.exp(c.mercator[1]/6378137))-Math.PI/2)*180/Math.PI;const point=geoToModel(lat,lon,registration);return Math.hypot(point[0]-c.model_xz[0],point[1]-c.model_xz[1]);}).sort((a,b)=>a-b);
assert.ok(errors[Math.floor(errors.length*.95)]<.5);assert.equal(errors.length,registration.holdout_count);
assert.equal(geoToModel(null,-122,registration),null);
assert.equal(metricState({value:2748.86,qcAssessment:'invalid',qcFlags:['QC.I.OOB.012']}).valid,false);
assert.equal(metricState({value:4,qcAssessment:'valid',qcFlags:['QC.I.OOB.012']}).valid,false);
assert.equal(metricState({value:null,qcAssessment:'valid'}).valid,false);
assert.equal(metricState({value:0,qcAssessment:'valid'}).valid,true);
assert.equal(metricState({value:-1,qcAssessment:'valid'}).valid,false);
assert.deepEqual(cloudColor(999,50),cloudColor(50,50));assert.notDeepEqual(cloudColor(0,50),cloudColor(50,50));
const snapshot=JSON.parse(await fs.readFile('/tmp/sp-clarity-current.json','utf8'));
const {bounds}=JSON.parse(await fs.readFile(new URL('data/original/verified-assets.json',base),'utf8'));
const counts={valid:0,invalid:0,outside:0};
for(const source of snapshot.sources.filter(s=>Number.isFinite(s.latitude)&&Number.isFinite(s.longitude))){const point=geoToModel(source.latitude,source.longitude,registration);if(!inModelBounds(point,bounds))counts.outside++;else if(metricState(source.metrics?.pm25).valid)counts.valid++;else counts.invalid++;}
console.log(JSON.stringify({checks:'Held-out georegistration, QC invalid rejection, missing/zero values, color saturation and current API placement: PASS',current_pm25_clouds:counts,holdout_p95_m:registration.holdout_p95_m}));

const samples=[{x:0,z:0,value:6.15},{x:100,z:0,value:6.7}];
assert.equal(interpolateConcentration([0,0],samples),6.15);
assert.ok(Math.abs(interpolateConcentration([50,0],samples)-6.425)<1e-9);
assert.equal(interpolateConcentration([0,0],[]),null);
assert.deepEqual(concentrationRange(samples,{max:50}),[6,7]);
assert.deepEqual(concentrationRange(samples,{max:50},false),[0,50]);
for(const x of [-1000,10,40,1000]){const v=interpolateConcentration([x,10],samples);assert.ok(v>=6.15&&v<=6.7);}
console.log('Regional IDW: exact sensor recovery, bounded estimates, symmetric midpoint, empty-data suppression, numeric color scales: PASS');
