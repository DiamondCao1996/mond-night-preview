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
