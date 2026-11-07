import test from 'node:test';
import assert from 'node:assert/strict';
import {PMR_TRIGGER,PMR_ZONES,PMR_STEPS,sensorBaseline,pmrQuality,shouldOfferPmr,savePmrCompletion,loadPmr,momentInvitation} from '../assets/engine/pmr.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {clearAllFactorData} from '../assets/engine/store.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
const sample=(rmssd=40,mode='sensor')=>({mode,version:'mond-causal-1.1',window:180,stats:{rmssd_ms:rmssd,sdnn_ms:35,mean_hr_bpm:65}});
const profile={schema:1,baselines:{sensor:[sample()],demo:[sample(100,'demo')]}};
const session=()=>({mode:'sensor',status:'connected',stale:false,warming:false,processing_version:'mond-causal-1.1',elapsed:180,metrics:{rmssd:20},series:Array.from({length:181},(_,i)=>({time_s:i,event_index:i,corrected_ms:i%2?800:820,action:'unchanged'}))});
test('PMR threshold is inclusive at a 50% drop against sensor quiet samples',()=>{
 assert.equal(PMR_TRIGGER.dropFraction,.5);assert.equal(sensorBaseline(profile),40);
 for(const current of [20,19,0]){const s=session();s.metrics.rmssd=current;assert.equal(shouldOfferPmr({session:s,profile}),true);}
 const s=session();s.metrics.rmssd=30;assert.equal(shouldOfferPmr({session:s,profile}),false);
});
test('PMR requires a matching finite sensor quiet baseline, never demo or overnight priors',()=>{
 for(const p of [null,{}, {baselines:{sensor:[],demo:[sample(100,'demo')]}},{baselines:{sensor:[sample(0)]}},{baselines:{sensor:[sample(40,'demo')]}},{baselines:{sensor:[{...sample(),version:'old'}]}},{baselines:{sensor:[{...sample(),window:60}]}},{baselines:{sensor:[{...sample(),stats:{rmssd_ms:40,sdnn_ms:null,mean_hr_bpm:65}}]}}])assert.equal(shouldOfferPmr({session:session(),profile:p}),false);
 assert.equal(sensorBaseline({baselines:{sensor:[sample(30),sample(50),{...sample(900),version:'old'}]}}),40);
});
test('PMR rejects warming, stale, disconnected, demo, invalid metrics and version',()=>{
 for(const override of [{warming:true},{stale:true},{status:'disconnected'},{mode:'demo'},{mode:'idle'},{metrics:{rmssd:null}},{metrics:{rmssd:NaN}},{processing_version:'old'},{elapsed:179}])assert.equal(shouldOfferPmr({session:{...session(),...override},profile}),false,JSON.stringify(override));
});
test('PMR checks continuous window edges, gaps, altered ratio and truly adjacent retained pairs',()=>{
 assert.equal(pmrQuality(session()),true);
 const check=mutate=>{const s=session();mutate(s);assert.equal(pmrQuality(s),false);};
 check(s=>s.series.splice(0,7));check(s=>s.series.splice(-7));check(s=>s.series.splice(40,7));
 check(s=>s.series.forEach((r,i)=>{if(i<19)r.action='corrected';}));
 check(s=>s.series.forEach(r=>r.event_index*=2));check(s=>s.series.forEach((r,i)=>{if(i>20)r.corrected_ms=null;}));
 const s=session();s.series.forEach((r,i)=>{if(i<18)r.action='corrected';});assert.equal(pmrQuality(s),true);
});
test('PMR preserves the page zone order and three instructions exactly',()=>{
 assert.deepEqual(PMR_ZONES.map(z=>z.zh),['额头与眉毛','下颌与嘴唇','肩膀与颈部','胸部','上臂','手部与前臂','腹部','大腿','小腿','脚部']);
 assert.deepEqual(PMR_STEPS.map(s=>s.zh),['① 吸气收紧（紧绷肌肉 5 秒）','② 呼气释放（逐渐放松，并觉察放松的感觉）','③ 停顿片刻，体会变化和放松感']);
});
test('PMR completion round-trips with optional fields empty, validates, and clears',()=>{
 try{clearAllFactorData();const input={practice:'pmr',source:'home',completedZoneIds:PMR_ZONES.slice(0,9).map(z=>z.id),skippedZoneIds:['feet']};const saved=savePmrCompletion(input);assert.deepEqual(loadPmr(),[saved]);assert.ok(saved.utc&&saved.date);assert.equal(saved.note,'');assert.deepEqual(saved.tags,[]);
 const written=savePmrCompletion({...input,source:'invitation',note:'warm hands',tags:['care'],wandering:'the sea'});assert.deepEqual(loadPmr().at(-1),written);
 for(const bad of [{},{...input,practice:'other'},{...input,source:'unknown'},{...input,skippedZoneIds:[]},{...input,skippedZoneIds:['forehead']}])assert.throws(()=>savePmrCompletion(bad));
 clearAllFactorData();assert.deepEqual(loadPmr(),[]);
 }finally{clearAllFactorData();}
});
test('combined invitation recommends PMR and keeps emotion strategy secondary; standalone aid survives',()=>{
 const entry={path:[{id:'anger'}],intensity:3};const both=momentInvitation({session:session(),profile,entry});assert.equal(both.primary.id,'pmr');assert.equal(both.alternative.id,'forest-leaves');assert.equal(momentInvitation({entry}).primary.id,'forest-leaves');assert.equal(momentInvitation({session:session(),profile}).alternative,null);
});
test('combined invitation renders exactly one primary action and quiet alternatives',async()=>{
 const previous={document:globalThis.document,window:globalThis.window,location:globalThis.location,localStorage:globalThis.localStorage};let dialog;
 const node=()=>({addEventListener(type,fn){this[type]=fn;},textContent:'',value:'en',focus(){}});
 const elements=new Map(),nodes=new Map();const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
 const host=get('relax-view');host.querySelector=selector=>{if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);};host.querySelectorAll=()=>[];
 globalThis.document={addEventListener(){},querySelectorAll:()=>[],documentElement:{lang:'en'},getElementById:get,createElement:()=>dialog={nodes:new Map(),setAttribute(){},querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,node());return this.nodes.get(selector);},addEventListener(){},showModal(){},close(){},remove(){},innerHTML:''},body:{append(){}}};
 globalThis.window={addEventListener(){},removeEventListener(){},dispatchEvent(){}};let hash='#home';globalThis.location={get hash(){return hash;},set hash(value){hash=value.startsWith('#')?value:'#'+value;}};const storage=new Map([['mond-profile',JSON.stringify(profile)]]);globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
 try{const {offerMomentCare}=await import('../assets/pmr.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca');offerMomentCare({session:session()},{path:[{id:'anger'}],intensity:3});assert.equal((dialog.innerHTML.match(/class="primary"/g)||[]).length,1);assert.match(dialog.innerHTML,/class="text-button" data-aid/);assert.match(dialog.innerHTML,/class="text-button" data-no/);
 dialog.querySelector('[data-pmr]').onclick();assert.match(host.innerHTML,/Begin practice/);
 host.querySelector('[data-next]').click();
 for(let i=0;i<10;i++){assert.match(host.innerHTML,new RegExp(PMR_ZONES[i].en));for(let phase=0;phase<3;phase++)host.querySelector('[data-next]').click();}
 assert.match(host.innerHTML,/Non-judgmental awareness/);host.querySelector('[data-next]').click();assert.match(host.innerHTML,/Did your attention wander/);host.querySelector('[data-next]').click();assert.match(host.innerHTML,/Your practice is saved/);assert.equal(loadPmr().at(-1).source,'invitation');assert.equal(loadPmr().at(-1).completedZoneIds.length,10);}
 finally{for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
