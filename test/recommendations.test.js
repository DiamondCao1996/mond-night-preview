import test from 'node:test';
import assert from 'node:assert/strict';
import {recommend,currentRmssd,qualifiedBaseline,sensorEvidence,latestEmotion} from '../assets/engine/recommendations.js';
const now=Date.now();
export const session=(value=40,id='current')=>({session_id:id,device:'MOND-test',mode:'sensor',status:'connected',stale:false,warming:false,processing_version:'mond-causal-1.1',elapsed:180,metrics:{rmssd:value},series:Array.from({length:181},(_,i)=>({time_s:i,event_index:i,corrected_ms:800+(i%2?value:0),action:'unchanged'}))});
export const moment=(value=40,id='current',time=now)=>({id,session:session(value,id),saved_at:time/1000});
export const profile=()=>({baselines:{sensor:[{id:'quiet',device:'MOND-test',mode:'sensor',version:'mond-causal-1.1',window:180,saved_at:now-60000,altered:0,stats:{rmssd_ms:40,sdnn_ms:30,mean_hr_bpm:70,successive_pairs:180}}],demo:[{stats:{rmssd_ms:500}}]}});
const options=value=>({moment:moment(value),profile:profile(),now});
test('qualified low/near/high RMSSD chooses body/reflection/optional action, exact boundaries',()=>{
 for(const [value,primary,status] of [[0,'relax','low'],[20,'relax','low'],[21,'finger-breathing','low'],[32,'finger-breathing','low'],[32.1,'reframe','near'],[40,'reframe','near'],[48,'reframe','near'],[49,'actions','high']]){const r=recommend(options(value));assert.equal(r.primary,primary,String(value));assert.equal(r.evidence.status,status);assert.equal(r.evidence.baseline,40);}
});
test('comparison recomputes actual 180s data, never uses the five-minute display metric',()=>{
 const s=session(20);s.metrics.rmssd=999;assert.equal(currentRmssd(s),20);s.elapsed=300;s.series=Array.from({length:301},(_,i)=>({time_s:i,event_index:i,corrected_ms:800+(i%2?(i<120?200:10):0),action:'unchanged'}));assert.equal(currentRmssd(s),10);
});
test('absent, demo, legacy, incompatible, stale or unqualified baseline never becomes near/high',()=>{
 for(const change of [p=>p.baselines.sensor=[],p=>delete p.baselines.sensor[0].device,p=>p.baselines.sensor[0].device='other',p=>p.baselines.sensor[0].version='old',p=>p.baselines.sensor[0].window=60,p=>p.baselines.sensor[0].mode='demo',p=>p.baselines.sensor[0].saved_at=now-31*86400000,p=>p.baselines.sensor[0].saved_at=now+1,p=>p.baselines.sensor[0].altered=.051,p=>p.baselines.sensor[0].stats.successive_pairs=29,p=>p.baselines.sensor[0].stats.rmssd_ms=0,p=>p.baselines.sensor[0].stats.sdnn_ms=null,p=>p.baselines.sensor[0].id='current']){const o=options(90);change(o.profile);const r=recommend(o);assert.equal(r.evidence.status,'no-baseline');assert.equal(r.primary,'senses');assert.equal(r.evidence.trend,null);}
 assert.equal(recommend({moment:moment(80),now}).evidence.status,'no-baseline');
});
test('quiet comparison uses median compatible real references, not demo priors',()=>{
 const p=profile(),b=p.baselines.sensor[0];p.baselines.sensor=[{...b,id:'a',stats:{...b.stats,rmssd_ms:30}},{...b,id:'b',stats:{...b.stats,rmssd_ms:40}},{...b,id:'c',stats:{...b.stats,rmssd_ms:500}}];assert.equal(qualifiedBaseline(p,session(),now),40);
});
test('poor, invalid, altered, disconnected, stale, gapped and warming data abstains',()=>{
 const cases=[s=>s.stale=true,s=>s.warming=true,s=>s.mode='demo',s=>s.status='stopped',s=>s.processing_version='old',s=>s.elapsed=179,s=>s.metrics.rmssd=NaN,s=>s.series.splice(50,8),s=>s.series.splice(0,7),s=>s.series.splice(-7),s=>s.series.forEach((r,i)=>{if(i<19)r.action='removed';}),s=>s.series.forEach(r=>r.event_index*=2),s=>s.series.forEach(r=>r.corrected_ms=null),s=>s.series.at(-1).time_s=999,s=>s.series.at(-1).corrected_ms=1e308,s=>s.series.at(-1).event_index=NaN,s=>delete s.device,s=>delete s.session_id];
 for(const change of cases){const o=options(90);change(o.moment.session);const r=recommend(o);assert.equal(r.evidence.status,'poor');assert.equal(r.primary,'senses');assert.equal(r.evidence.trend,null);}
 for(const time of [now-16*60000,now+1])assert.equal(recommend({...options(90),moment:moment(90,'current',time)}).evidence.status,'stale');
 assert.equal(recommend({now}).evidence.status,'absent');
});
test('measured trend requires two actual fresh compatible distinct sessions and no synthetic nights',()=>{
 const o=options(60);for(const history of [[],[moment(20,'a',now-60000)],[moment(20,'a',now-60000),moment(20,'a',now-50000)], [moment(20,'current',now-60000),moment(20,'b',now-8*86400000)]])assert.equal(sensorEvidence({...o,history}).trend,null);
 const history=[moment(20,'a',now-60000),moment(20,'b',now-120000)];assert.equal(sensorEvidence({...o,history}).trend,'higher');
 history[1].session.device='other';assert.equal(sensorEvidence({...o,history}).trend,null);
 history[1]=moment(20,'b',now-120000);history[1].session.mode='demo';assert.equal(sensorEvidence({...o,history}).trend,null);
 const falling=[moment(100,'a',now-60000),moment(100,'b',now-120000)];const r=recommend({...o,history:falling});assert.equal(r.evidence.trend,'lower');assert.equal(r.primary,'finger-breathing');
 assert.equal(sensorEvidence({...options(40),history:[moment(40,'a',now-60000),moment(40,'b',now-120000)]}).trend,'steady');
});
for(const core of ['anger','fear','disgust','sadness','low','joy','surprise'])for(const intensity of [undefined,1,3,4,5])test(`emotion priority ${core} intensity ${intensity}`,()=>{
 const r=recommend({...options(90),entry:{path:[{id:core}],intensity}}),negative=['anger','fear','disgust','sadness','low'].includes(core);
 if(negative&&intensity>=4)assert.equal(r.primary,'safe-space');else if(['anger','fear','disgust'].includes(core))assert.equal(r.primary,'forest');else if(['sadness','low'].includes(core))assert.equal(r.primary,'energy-menu');else assert.equal(r.primary,'actions');
});
test('intense emotions override low PMR and high optimistic sensor routes; no HRV emergency inference',()=>{
 for(const value of [10,90]){const r=recommend({...options(value),entry:{path:[{id:'sadness'}],intensity:5}});assert.equal(r.primary,'safe-space');assert.equal(r.reason,'intense');}
 assert.equal(recommend({...options(100),unsafe:true}).primary,'safe-space');assert.equal(recommend(options(0)).reason,'sensor-low');
 assert.equal(recommend({...options(10),entry:{path:[{id:'sadness'}],intensity:2}}).primary,'relax');
});
test('no-sensor optional state chips map deterministically without compulsory answers',()=>{
 for(const [state,primary]of [[undefined,'senses'],['tense','finger-breathing'],['low','energy-menu'],['scattered','stop'],['numb','senses'],['okay','pearls']]){const r=recommend({state,now});assert.equal(r.primary,primary);assert.equal(r.evidence.status,'absent');}
});
test('each result has one primary, short reason keys and one or two distinct quiet alternatives',()=>{
 for(const input of [{},options(10),options(40),options(90),{state:'tense'},{entry:{path:[{id:'anger'}],intensity:5}}]){const r=recommend(input);assert.equal(typeof r.primary,'string');assert.ok(r.reason.length);assert.ok(r.reasons.length);assert.ok(r.alternatives.length>=1&&r.alternatives.length<=2);assert.ok(!r.alternatives.includes(r.primary));assert.deepEqual(r,recommend(input));}
});
test('latest logged emotion rejects future, stale, malformed records; actual latest wins',()=>{
 const a={utc:new Date(now-1000).toISOString(),path:[{id:'joy'}]},b={utc:new Date(now-500).toISOString(),path:[{id:'fear'}]};assert.equal(latestEmotion([b,a,{utc:'bad'},{utc:new Date(now+1000).toISOString()}],now),b);assert.equal(latestEmotion([{utc:new Date(now-2*86400000).toISOString()}],now),undefined);
});

test('abbreviated descendant paths and explicit unsafe reports keep emotion priority',()=>{assert.equal(recommend({...options(90),entry:{path:[{id:'aggressive'}],intensity:5}}).primary,'safe-space');assert.equal(recommend({...options(90),entry:{path:[{id:'joy'}],unsafe:true}}).primary,'safe-space');});
