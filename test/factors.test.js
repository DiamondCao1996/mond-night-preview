import test from 'node:test';
import assert from 'node:assert/strict';
import {FACTORS,getFactor,evaluateFactor,assertSafeFactorOutput} from '../assets/engine/factors/index.js';
import {generateSampleNights,runCAS} from '../assets/engine/index.js';
import {personalAssociation,associationsFromLogs} from '../assets/engine/associations.js';
import {parseImport,exportTimeline} from '../assets/engine/importData.js';
import {saveProfile,loadProfile,saveLogs,loadLogs,saveImportedNights,loadNights,mergeLogsIntoNights,clearAllFactorData} from '../assets/engine/store.js';
const nights=generateSampleNights();
const m={utc:'2026-10-01T22:00:00Z',timezone:'Europe/Stockholm',device:'sample-ppg',metric:'RMSSD',unit:'ms',value:55,window:'overnight',quality:'good'};
const parse=(measurements,events=[])=>parseImport(JSON.stringify({version:1,measurements,events}));
test('18 ordered localized factors with source-backed output contracts',()=>{
 assert.equal(FACTORS.length,18);assert.equal(new Set(FACTORS.map(f=>f.id)).size,18);
 FACTORS.forEach((f,i)=>{assert.equal(f.number,i+1);assert.ok(f.citations.length);for(const key of ['role','outputType','evidenceStrength'])assert.ok(f[key]);for(const key of ['names','short','evidence','limits','proposedUse'])for(const l of ['en','zh-CN','sv'])assert.ok(f[key][l]);});
});
test('clinical pathways expose evidence only and reject nested forbidden payloads',()=>{
 for(const id of ['heartFailure','mentalHealth','lifeExpectancy']){
  const f=getFactor(id);assert.equal(f.outputType,'evidence-only');for(const key of ['individual-risk-score','diagnosis','years-of-life'])assert.ok(f.forbiddenOutputs.includes(key));
  const result=evaluateFactor(id,{nights,profile:{age:60}});assert.equal(result.type,'evidence-only');assert.doesNotThrow(()=>assertSafeFactorOutput(f,result));
  for(const key of ['riskScore','diagnosis','yearsOfLife','lifeExpectancyYears','survivalProbability','hazard','clinicalRisk']){assert.ok(!Object.hasOwn(result,key));assert.throws(()=>assertSafeFactorOutput(f,{nested:[{[key]:42}]}));}
 }
 assert.ok(getFactor('lifeExpectancy').forbiddenOutputs.includes('life-expectancy-prediction'));
});
test('logged associations require adequate groups, quality and calendar lag',()=>{
 assert.equal(personalAssociation(nights,{exposure:'meditation'}).status,'not-enough-data');
 const a=personalAssociation(nights,{exposure:'alcoholLogged'});assert.equal(a.status,'ok');assert.ok(Number.isFinite(a.delta));assert.ok(a.lo<a.delta&&a.delta<a.hi);assert.ok(a.nWith>=5&&a.nWithout>=5);
 assert.equal(personalAssociation(nights.map(n=>({...n,metric:'SDNN'})),{exposure:'alcoholLogged'}).status,'not-enough-data');
 const gap=[{...nights[0],date:'2026-01-01',events:[{type:'workout'}]},{...nights[1],date:'2026-01-03',quality:'good'}];assert.equal(personalAssociation(gap,{exposure:'workout',minN:1}).nWith,0);
});
test('no behaviors can be invented from physiological dips',()=>{
 const unlogged=nights.map((n,i)=>({...n,events:[],hrvRmssdMs:i%2?20:100}));
 for(const a of Object.values(associationsFromLogs(unlogged)))assert.equal(a.status,'not-enough-data');
 assert.equal(associationsFromLogs(unlogged).alcoholLogged.nWith,0);
});
test('import validates metric, fields, timestamps, numeric values and windows',()=>{
 assert.equal(parse([{...m,metric:'SDNN'}]).ok,false);
 assert.match(parse([{...m,metric:'SDNN'}]).errors.join(),/cannot mix SDNN with RMSSD/);
 const {utc,...missing}=m;assert.equal(parse([missing]).ok,false);
 for(const utc of ['wrong','2026-13-01T00:00:00Z','2026-02-30T00:00:00Z'])assert.equal(parse([{...m,utc}]).ok,false);
 assert.equal(parse([{...m,value:'oops'}]).ok,false);
 const mixed=parse([m,{...m,window:'paced-breathing'}]);assert.ok(mixed.errors.length||mixed.warnings.some(w=>w.includes('excluded')));assert.equal(mixed.nights.length,1);
 const valid=parse([m],[{type:'reading',utc:m.utc}]);assert.equal(valid.ok,true);assert.equal(valid.nights[0].metric,'RMSSD');assert.equal(valid.nights[0].date,'2026-10-02');assert.equal(valid.nights[0].events[0].type,'reading');
 const different=parse([{...m,device:'other-ppg'}]);assert.equal(different.nights[0].device,'other-ppg');assert.equal(runCAS(different.nights).abstain,true);
});
test('timeline JSON and CSV round-trip preserves measurements and explicit events',()=>{
 for(const format of ['json','csv']){const result=parseImport(exportTimeline(nights,{format}),{format});assert.equal(result.ok,true,result.errors.join());assert.equal(result.nights.length,nights.length);assert.equal(result.nights[0].hrvRmssdMs,nights[0].hrvRmssdMs);assert.ok(result.events.some(e=>e.type==='alcoholLogged'));}
});
test('node-safe storage, explicit log merge and complete deletion',()=>{
 clearAllFactorData();assert.equal(loadNights(),null);saveProfile({age:44});assert.equal(loadProfile().age,44);saveLogs([{date:nights[0].date,types:['reading']}]);saveImportedNights(nights);assert.equal(loadNights().length,42);
 const merged=mergeLogsIntoNights(nights,loadLogs());assert.ok(merged[0].events.some(e=>e.type==='reading'));assert.ok(!nights[0].events.some(e=>e.type==='reading')||nights[0].events!==merged[0].events);assert.equal(merged[1].events.length,nights[1].events.length);
 clearAllFactorData();assert.deepEqual(loadProfile(),{});assert.deepEqual(loadLogs(),[]);assert.equal(loadNights(),null);
});
test('profile covariates are small priors; education and health never change forecasts',()=>{
 assert.notEqual(runCAS([],{profile:{age:70}}).forecast.hrvRmssdMs.mean,runCAS([]).forecast.hrvRmssdMs.mean);
 assert.notEqual(runCAS([],{profile:{heightCm:190}}).forecast.rhrBpm.mean,runCAS([]).forecast.rhrBpm.mean);
 assert.deepEqual(runCAS(nights,{profile:{education:'doctorate',health:{knownConditions:'anything'}}}),runCAS(nights));
});
