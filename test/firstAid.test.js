import test from 'node:test';
import assert from 'node:assert/strict';
import {FIRST_AID_STRATEGIES,FIRST_AID_TRIGGER,shouldOfferFirstAid,strategyForEntry,saveFirstAidExercise} from '../assets/engine/firstAid.js';
import {loadFirstAid,saveFirstAid,clearAllFactorData} from '../assets/engine/store.js';
const entry=(id,intensity)=>({path:[{id}],intensity});
test('only intense negative cores and their descendants offer first aid',()=>{
 for(const id of ['sadness','fear','anger','disgust','low','lonely'])for(const n of [4,5])assert.equal(shouldOfferFirstAid(entry(id,n)),true,`${id} ${n}`);
 for(const id of ['joy','surprise'])assert.equal(shouldOfferFirstAid(entry(id,5)),false);
 for(const n of [3,undefined,null,'4',4.5,NaN])assert.equal(shouldOfferFirstAid(entry('sadness',n)),false);
 assert.equal(shouldOfferFirstAid({}),false);assert.equal(shouldOfferFirstAid(null),false);assert.equal(shouldOfferFirstAid(entry('missing',5)),false);
});
test('workbook vocabulary and default strategy are complete',()=>{
 const s=FIRST_AID_STRATEGIES[0];assert.equal(s.id,'safe-space-within');assert.ok(s.title.zh&&s.title.en);assert.equal(s.textures.length,9);assert.equal(s.questions.length,3);assert.equal(s.steps.length,5);
 assert.deepEqual(s.textures.map(x=>x.en),['bumpy','hollow','constricted','stuck','spinning','mushy','heavy','knotted','burning']);
 assert.deepEqual(s.sizes.map(x=>x.id),['whale','lamb','starfish','bubbles']);assert.deepEqual(FIRST_AID_TRIGGER.strategyByNodeId,{});
 assert.equal(strategyForEntry(entry('sadness',4)),s);assert.equal(strategyForEntry(entry('joy',5)),null);
});
test('strategy mappings prefer leaf then ancestors, including abbreviated child paths',()=>{
 const map=FIRST_AID_TRIGGER.strategyByNodeId;
 try{map.sadness='safe-space-within';map.lonely='unknown';assert.equal(strategyForEntry(entry('lonely',4)),null);delete map.lonely;assert.equal(strategyForEntry(entry('lonely',4)).id,'safe-space-within');}
 finally{for(const id of Object.keys(map))delete map[id];}
});
test('exercise save round-trips, validates completion, and all data clearing removes logs',()=>{
 try{
 clearAllFactorData();const input={strategyId:'safe-space-within',before:4,after:2,color:'#8fb8cf',size:'whale',texture:'heavy',emotionId:'emotion-123'};
 const saved=saveFirstAidExercise(input);assert.deepEqual(loadFirstAid(),[saved]);for(const [key,value] of Object.entries(input))assert.equal(saved[key],value);assert.ok(saved.id&&saved.utc&&saved.date);
 const custom=saveFirstAidExercise({...input,texture:'custom',textureCustom:'  prickly  '});assert.equal(custom.textureCustom,'prickly');
 assert.throws(()=>saveFirstAidExercise({...input,before:0}));assert.throws(()=>saveFirstAidExercise({...input,texture:'custom',textureCustom:' '}));
 saveFirstAid(loadFirstAid());assert.equal(loadFirstAid().length,2);clearAllFactorData();assert.deepEqual(loadFirstAid(),[]);
 }finally{clearAllFactorData();}
});

test('FOREST invitations include low and missing intensity and abbreviated aggressive descendants',async()=>{
 const {invitationForEntry}=await import('../assets/engine/firstAid.js');
 for(const [id,n] of [['anger',1],['anger',4],['fear',undefined],['disgust',2],['aggressive',1],['provoked',undefined],['hostile',1]]){
  const e=entry(id,n),invite=invitationForEntry(e);assert.equal(shouldOfferFirstAid(e),true);assert.equal(strategyForEntry(e).id,'forest-leaves');assert.equal(invite.primary.id,'forest-leaves');assert.ok(invite.alternatives.some(s=>s.id==='safe-space-within'));
 }
 for(const id of ['sadness','low','lonely']){const invite=invitationForEntry(entry(id,4));assert.equal(invite.primary.id,'safe-space-within');assert.ok(invite.alternatives.some(s=>s.id==='forest-leaves'));}
 for(const e of [entry('sadness',3),entry('joy',5),entry('surprise',5)])assert.equal(invitationForEntry(e),null);
 const map=FIRST_AID_TRIGGER.strategyByNodeId;
 try{map.anger='safe-space-within';map.hostile='forest-leaves';assert.equal(strategyForEntry(entry('hostile',1)).id,'forest-leaves');delete map.hostile;assert.equal(strategyForEntry(entry('hostile',1)).id,'safe-space-within');}finally{for(const key of Object.keys(map))delete map[key];}
});
test('new workbook strategies preserve transcription and printed English',()=>{
 const forest=FIRST_AID_STRATEGIES.find(s=>s.id==='forest-leaves'),box=FIRST_AID_STRATEGIES.find(s=>s.id==='box-breathing');
 assert.equal(forest.poem.length,12);assert.equal(forest.poem[0].zh,'当情绪如风暴般涌来，你或许会想推开、压抑，甚至与之抗争。');assert.equal(forest.excerpt.length,2);
 assert.deepEqual(forest.steps.map(s=>s.label),['FEELING','OCCURENCE','REQUIREMENT','ETHOS','SOURCE','TEND']);assert.equal(forest.cloud.length,2);assert.ok(forest.cloud[0].zh.includes('接纳的云朵'));assert.equal(forest.butterfly.steps.length,4);assert.ok(forest.butterfly.steps[3].zh.startsWith('d.'));assert.equal(forest.leaflet.lines.length,4);assert.ok(forest.leaflet.lines[3].zh.includes('我练习做一棵不评判的树'));
 assert.equal(box.steps.length,5);assert.ok(box.steps[0].zh.includes('默数1-2-3-4'));assert.ok(box.steps[4].zh.includes('适用场景'));assert.equal(box.seconds,4);assert.deepEqual(box.cycles,[4,6]);
 for(const rule of [FIRST_AID_TRIGGER.forestAnyIntensity,FIRST_AID_TRIGGER.defaultInvitation]){assert.notEqual(rule.strategyId,box.id);assert.ok(!rule.alternatives.includes(box.id));}
});
test('FOREST exercises round-trip, validate, delete, and clear alongside Safe Space',async()=>{
 const {saveForestExercise,deleteFirstAid}=await import('../assets/engine/firstAid.js');
 try{clearAllFactorData();const input={leaf:{shape:'curled',weight:'heavy',color:'#8fb8cf',name:'Anxiety'},cloudReleased:true,tend:true,emotionId:'emotion-forest',occurrence:'An argument',requirement:'Rest',ethos:'I must hurry',source:'School',butterfly:{note:'I can pause'}};
 const saved=saveForestExercise(input);assert.deepEqual(loadFirstAid(),[saved]);for(const [key,value] of Object.entries(input))assert.deepEqual(saved[key],value);assert.equal(saved.strategyId,'forest-leaves');assert.ok(saved.id&&saved.utc&&saved.date);
 for(const bad of [{...input,cloudReleased:false},{...input,leaf:{...input.leaf,name:' '}},{...input,leaf:{...input.leaf,shape:'unknown'}}])assert.throws(()=>saveForestExercise(bad));
 const safe=saveFirstAidExercise({strategyId:'safe-space-within',before:4,after:2,color:'#8fb8cf',size:'whale',texture:'heavy'});deleteFirstAid(saved.id);assert.deepEqual(loadFirstAid(),[safe]);saveForestExercise(input);clearAllFactorData();assert.deepEqual(loadFirstAid(),[]);
 }finally{clearAllFactorData();}
});
