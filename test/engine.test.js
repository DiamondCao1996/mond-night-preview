import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSampleNights,runCAS,baselines} from '../assets/engine/index.js';
const nights=generateSampleNights();
test('seeded comparable sample with gaps',()=>{
 assert.deepEqual(nights,generateSampleNights());assert.equal(nights.length,42);
 assert.ok(nights.some(n=>n.quality==='missing'));assert.ok(nights.some(n=>n.quality==='poor'));
 assert.ok(nights.every(n=>n.metric==='RMSSD'&&!('sdnnMs' in n)));
 assert.notDeepEqual(nights,generateSampleNights({seed:1}));
});
test('finite bounded forecasts and normalized adaptive weights',()=>{
 const r=runCAS(nights);for(const f of Object.values(r.forecast)){assert.ok([f.mean,f.lo,f.hi].every(Number.isFinite));assert.ok(f.lo<f.mean&&f.mean<f.hi);}
 assert.ok(Math.abs(Object.values(r.weights).reduce((a,b)=>a+b,0)-1)<1e-9);
 assert.equal(r.judgment.observational,true);assert.equal(r.judgment.suggestion,null);
});
test('insufficient comparable observations abstain, including incompatible metrics',()=>{
 for(const series of [[],nights.map(n=>({...n,quality:'missing',hrvRmssdMs:null,rhrBpm:null})),nights.map(n=>({...n,metric:'SDNN'}))]){
 const r=runCAS(series);assert.equal(r.abstain,true);assert.equal(r.judgment.suggestion,'none');
 }
});
test('personal adaptation and contextual forecast beat simple demo comparisons',()=>{
 const r=runCAS(nights).backtest.models, frozen=runCAS(nights,{adapt:false}).backtest.models;
 assert.ok(r.cas.hrvMae<frozen.cas.hrvMae*.99);
 assert.ok(r.cas.hrvMae<=r.personalAverage.hrvMae*1.05);
 assert.ok(r.cas.hrvMae<=r.lastValue.hrvMae*1.05);
 assert.notEqual(r.noHrv.hrvMae,r.cas.hrvMae);
});
test('no-HRV alternative is independent of HRV history',()=>{
 const changed=nights.map(n=>({...n,hrvRmssdMs:150}));
 assert.equal(baselines(nights).noHrv.hrvRmssdMs,baselines(changed).noHrv.hrvRmssdMs);
});
test('chronology and prefix forecasts are deterministic',()=>{
 assert.throws(()=>runCAS([...nights].reverse()),RangeError);
 const prefix=nights.slice(0,20);assert.deepEqual(runCAS(prefix),runCAS(prefix));
 assert.equal(runCAS(nights).backtest.n,24);
});
