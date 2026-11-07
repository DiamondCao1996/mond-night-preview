import test from 'node:test';
import assert from 'node:assert/strict';
import {FACTORS,getFactor,evaluateFactor,assertSafeFactorOutput} from '../assets/engine/factors/index.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {generateSampleNights,runCAS} from '../assets/engine/index.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {personalAssociation,associationsFromLogs} from '../assets/engine/associations.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {parseImport,exportTimeline} from '../assets/engine/importData.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {saveProfile,loadProfile,saveLogs,loadLogs,saveImportedNights,loadNights,mergeLogsIntoNights,clearAllFactorData} from '../assets/engine/store.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
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

import {EVIDENCE_STRENGTH_LABELS,literatureCell} from '../assets/engine/factors/index.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
test('report audit pins every factor badge, target direction and cited design',()=>{
 const audit = {
  hrv:['guideline','Guide','contextual',null,null,['32','35']],
  rhr:['observational','Obs',null,'contextual',null,['3']],
  sleep:['meta-obs','Meta (obs)','down',null,null,['21','23']],
  activity:['meta-rct','Meta (RCT)','up',null,null,['36','31']],
  age:['observational','Obs','down',null,null,['8']],
  height:['adjacent','Adj',null,'down',null,['9']],
  education:['observational','Obs','up',null,null,['4']],
  heartFailure:['meta-obs','Meta (obs)','down',null,null,['10','11','12']],
  mentalHealth:['review','Review','mixed',null,null,['13']],
  lifeExpectancy:['meta-obs','Meta (obs)','contextual',null,null,['14','15']],
  diet:['meta-rct','Meta (RCT)','mixed',null,null,['16','17','18','19']],
  dailyHabits:['meta-obs','Meta (obs)','mixed',null,null,['20','22']],
  sport:['meta-obs','Meta (obs)','up',null,null,['24','25','34']],
  work:['review','Review','down','up',null,['26','27','33']],
  reading:['rct','RCT',null,null,'up',['5']],
  meditation:['meta-rct','Meta (RCT)','mixed',null,null,['6','7']],
  timeOfDay:['experimental','Exp','contextual',null,null,['1']],
  season:['observational','Obs','mixed','contextual',null,['2','3']]
 };
 assert.deepEqual(FACTORS.map(f=>f.id),Object.keys(audit));
 assert.equal(Object.keys(EVIDENCE_STRENGTH_LABELS).length,8);
 for(const [id,[strength,badge,...rest]] of Object.entries(audit)){
  const f=getFactor(id),directions=rest.slice(0,3),citations=rest[3];
  assert.equal(f.evidenceStrength,strength,id);
  assert.equal(EVIDENCE_STRENGTH_LABELS[strength],badge,id);
  assert.ok(f.evidenceDesigns.length>=1,id);
  const recorded=f.evidenceDesigns.flatMap(d=>d.citations);
  for(const citation of new Set([...citations,...f.citations]))assert.ok(recorded.includes(citation),`${id}: missing design for [${citation}]`);
  for(const d of f.evidenceDesigns){assert.ok(d.design);assert.ok(d.citations.length);for(const lang of ['en','zh-CN','sv'])assert.ok(d.detail[lang]);}
  ['hrv','rhr','sleep'].forEach((target,i)=>{
   const cell=literatureCell(f,target);
   if(directions[i]===null){assert.deepEqual(cell,{mapped:false},`${id}/${target}`);return;}
   assert.equal(cell.mapped,true);assert.equal(cell.direction,directions[i],`${id}/${target}`);
   assert.equal(cell.evidenceStrength,strength);assert.equal(cell.badge,badge);
   for(const lang of ['en','zh-CN','sv']){
    const title=literatureCell(f,target,lang).title;
    assert.ok(title.includes(badge));assert.ok(title.includes(directions[i]));
    for(const d of f.evidenceDesigns){assert.ok(title.includes(d.design));assert.ok(title.includes(d.detail[lang]));for(const c of d.citations)assert.ok(title.includes(`[${c}]`));}
   }
  });
 }
 assert.equal(getFactor('sleep').association.direction,'down');
 assert.equal(getFactor('meditation').association.direction,'mixed');
 assert.equal(getFactor('diet').association.direction,'mixed');
 assert.ok(FACTORS.every(f=>f.evidenceStrength!=='rct-meta'));
 assert.match(literatureCell(getFactor('education'),'hrv').title,/LF variability/);
});
