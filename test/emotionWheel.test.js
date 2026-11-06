import test from 'node:test';
import assert from 'node:assert/strict';
import {EMOTION_WHEEL as wheel,flattenWheel,findEmotion,wheelCounts} from '../assets/engine/emotionWheel.js';
import {addEmotion,deleteEmotion,emotionDistribution,exploreEmotionAssociations} from '../assets/engine/emotionLog.js';
import {loadEmotions,loadNights,saveEmotions,clearAllFactorData} from '../assets/engine/store.js';
test('printed wheel has complete vocabulary and distinct identifiers',()=>{
 assert.equal(wheel.length,7);assert.deepEqual(wheel.map(n=>n.zh),['恐惧','愤怒','厌恶','悲伤','快乐','惊讶','消极']);assert.deepEqual(wheel.map(n=>n.children.length),[6,8,4,6,9,4,4]);
 const flat=flattenWheel();assert.equal(new Set(flat.map(n=>n.id)).size,flat.length);
 for(const n of flat){assert.ok(n.zh&&n.en);assert.notEqual(n.uncertain,true);assert.equal(findEmotion(n.id).zh,n.zh);if(n.depth===1)assert.equal(n.children.length,2);}
 assert.equal(findEmotion('playful').zh,'玩要的');assert.ok(findEmotion('joy').children.some(n=>n.id==='playful'));assert.ok(findEmotion('sadness').children.some(n=>n.zh==='脆弱'));assert.ok(!flat.some(n=>n.zh==='郁闷'));
 assert.ok(findEmotion('anxious').children.some(n=>n.zh==='担心'));assert.ok(!findEmotion('fear').children.some(n=>n.zh==='担心'));
 assert.notEqual(findEmotion('anger').children.find(n=>n.zh==='失望').id,findEmotion('disgust').children.find(n=>n.zh==='失望').id);
 assert.equal(findEmotion('nonexistent'),null);assert.deepEqual(wheelCounts(),{level1:7,level2:41,level3:82});
});
test('local logging, deletion, distribution and clearing',()=>{
 try{
 clearAllFactorData();const path=[findEmotion('fear'),findEmotion('anxious'),findEmotion('worried')];
 for(let i=1;i<=3;i++)addEmotion({id:`e${i}`,path:path.slice(0,i),date:'2026-11-06',intensity:i,note:'A little note'});
 assert.equal(loadEmotions().length,3);assert.equal(loadEmotions()[2].path.length,3);assert.equal(loadEmotions()[2].note,'A little note');
 for(const intensity of [0,6,1.5]){addEmotion({path:path.slice(0,1),intensity,date:'2026-11-06'});assert.equal(loadEmotions().at(-1).intensity,undefined);}
 addEmotion({id:'five',path,intensity:5,date:'2026-10-15'});assert.equal(loadEmotions().at(-1).intensity,5);
 addEmotion({id:'old',path,date:'2026-09-01'});addEmotion({id:'future',path,date:'2026-11-07'});
 const entries=loadEmotions();saveEmotions(entries);assert.deepEqual(loadEmotions(),entries);
 assert.equal(emotionDistribution(entries,{days:7,now:new Date(2026,10,6)}).fear,6);assert.equal(emotionDistribution(entries,{days:30,now:new Date(2026,10,6)}).fear,7);
 deleteEmotion('e2');assert.equal(loadEmotions().length,entries.length-1);assert.ok(loadEmotions().some(e=>e.id==='e1'));assert.ok(!loadEmotions().some(e=>e.id==='e2'));
 assert.throws(()=>addEmotion({path:[findEmotion('fear'),findEmotion('playful')]}));
 clearAllFactorData();assert.deepEqual(loadEmotions(),[]);
 }finally{clearAllFactorData();}
});
test('associations require comparable groups and remain descriptive',()=>{
 const entries=Array.from({length:12},(_,i)=>({date:`2026-10-${String(i+1).padStart(2,'0')}`,path:[{id:i<6?'fear':'joy'}]}));
 const nights=entries.map((e,i)=>({date:e.date,quality:'good',device:'imported-device',metric:'RMSSD',window:'overnight',hrvRmssdMs:i<6?40:60,sleepMinutes:i<6?400:450}));
 assert.equal(exploreEmotionAssociations(nights.slice(0,3),entries).status,'not-enough-data');
 for(const metric of ['hrvRmssdMs','sleepMinutes']){const result=exploreEmotionAssociations(nights,entries,{metric});assert.equal(result.status,'ok');assert.equal(result.groups.fear.nWith,6);assert.equal(result.groups.fear.meanWith,metric==='hrvRmssdMs'?40:400);assert.ok(!/"(diagnosis|risk|yearsOfLife)"/.test(JSON.stringify(result)));}
 for(const replacement of [{quality:'poor'},{metric:'SDNN'},{window:'daytime'},{hrvRmssdMs:null}])assert.equal(exploreEmotionAssociations(nights.map(n=>({...n,...replacement})),entries).status,'not-enough-data');
 assert.equal(exploreEmotionAssociations(nights,[]).status,'not-enough-data');
 assert.equal(exploreEmotionAssociations(nights.map((n,i)=>({...n,device:i<6?'a':'b'})),entries).status,'not-enough-data');
});

test('feelings save without a device, nights or a live session',()=>{
 try{
  clearAllFactorData();
  assert.equal(loadNights(),null);
  addEmotion({id:'standalone-core',path:[findEmotion('joy')]});
  addEmotion({id:'standalone-deep',path:[findEmotion('fear'),findEmotion('anxious'),findEmotion('worried')],note:'  Just my words  ',intensity:4});
  const entries=loadEmotions();
  assert.equal(entries.length,2);
  assert.equal(entries[0].path.length,1);
  assert.equal(entries[0].note,undefined);
  assert.equal(entries[0].intensity,undefined);
  assert.equal(entries[1].path.length,3);
  assert.equal(entries[1].note,'Just my words');
  assert.equal(entries[1].intensity,4);
  assert.equal(loadNights(),null);
  for(const nights of [loadNights(),[]])for(const metric of ['hrvRmssdMs','sleepMinutes']){
   const result=exploreEmotionAssociations(nights,entries,{metric});
   assert.equal(result.status,'not-enough-data');
   assert.ok(Object.values(result.groups).every(g=>g.status==='not-enough-data'&&g.nWith===0&&g.nWithout===0));
   assert.ok(!/"[^"\n]*(diagnosis|risk|yearsOfLife)[^"\n]*"\s*:/i.test(JSON.stringify(result)));
  }
  deleteEmotion('standalone-core');
  assert.deepEqual(loadEmotions().map(e=>e.id),['standalone-deep']);
  deleteEmotion('standalone-deep');
  assert.deepEqual(loadEmotions(),[]);
 }finally{clearAllFactorData();}
});
