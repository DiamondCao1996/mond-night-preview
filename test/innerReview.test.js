import test from 'node:test';
import assert from 'node:assert/strict';
import {journalPane,isoWeekKey,classifyWeek,saveReviewLine,loadInnerReview,suggestedSteps} from '../assets/engine/innerReview.js';
import {addEmotion} from '../assets/engine/emotionLog.js';
import {loadEmotions,clearAllFactorData} from '../assets/engine/store.js';
const week='2026-W45',date='2026-11-06';
const emotion=(core,note='')=>({date,path:[{id:core}],note});
test('local ISO weeks start Monday and cross years correctly',()=>{
 for(const date of ['2026-11-04','2026-11-06','2026-11-08'])assert.equal(isoWeekKey(date),week);
 assert.equal(isoWeekKey('2026-11-09'),'2026-W46');
 assert.equal(isoWeekKey('2027-01-01'),'2026-W53');
 assert.equal(isoWeekKey(new Date(2026,10,6,23,59)),week);
 assert.equal(isoWeekKey('invalid'),null);
});
test('saved emotions, practices and reflections reach their appropriate columns',()=>{
 const model=classifyWeek({week,emotions:[emotion('anger','A hard conversation'),emotion('anger'),emotion('joy'),emotion('sadness')],firstAid:[{date,strategyId:'forest-leaves',occurrence:'At work',requirement:'Space',ethos:'I can pause',source:'A gentler perspective',leaf:{weight:'Heavy',shape:'Round',name:'My leaf'}},{date,strategyId:'safe-space-within',texture:'Soft'}],pmr:[{date,completedZoneIds:['hands'],tags:['body','care'],note:'Warm hands'}],logs:[{date,types:['reading']}]});
 const anger=model.auto.emotion.find(x=>x.id==='anger');assert.equal(anger.count,2);assert.match(anger.color,/^#/);
 for(const line of ['A hard conversation','At work','Space'])assert.ok(model.auto.emotion.some(x=>x.text===line));
 for(const id of ['forest-leaves','safe-space-within','pmr','reading'])assert.equal(model.auto.behavior.find(x=>x.id===id).count,1);
 assert.ok(!model.auto.behavior.some(x=>x.id==='box-breathing'));
 assert.ok(model.auto.body.some(x=>x.id==='body'));assert.ok(model.auto.body.some(x=>x.text==='Warm hands'));assert.ok(model.auto.body.some(x=>x.text==='Heavy'));assert.ok(model.auto.body.some(x=>x.text==='Soft'));
 assert.deepEqual(model.auto.belief.map(x=>x.text),['I can pause','A gentler perspective']);
 assert.equal(model.auto.energy.filter(x=>x.kind==='nourish').length,1);assert.equal(model.auto.energy.filter(x=>x.kind==='drain').length,3);
 assert.equal(suggestedSteps(model)[0].en,'Another gentle release can be a kind continuation.');
});
test('empty input creates no automatic content or beliefs',()=>{
 const result=classifyWeek({week});assert.equal(result.empty,true);for(const list of Object.values(result.auto))assert.deepEqual(list,[]);
 assert.deepEqual(classifyWeek({week,emotions:[emotion('joy','An ordinary note')]}).auto.belief,[]);
});
test('stored local date takes precedence over UTC; timestamps without dates use local calendar',()=>{
 const result=classifyWeek({week,emotions:[{...emotion('anger'),date:'2026-11-09',utc:'2026-11-06T10:00:00Z'},{path:[{id:'joy'}],utc:new Date(2026,10,6,12).toISOString()}]});
 assert.equal(result.auto.emotion.length,1);assert.equal(result.auto.emotion[0].id,'joy');
});
test('optional sensor comparison requires real sensor records and a compatible finite baseline',()=>{
 const sessions=[{date,session:{mode:'sensor',metrics:{rmssd:30}}}],profile={baselines:{sensor:[{mode:'sensor',version:'mond-causal-1.1',window:180,stats:{rmssd_ms:45}}]}};
 assert.equal(classifyWeek({week,sessions,profile}).auto.body[0].relation,'lower');
 for(const input of [{sessions},{profile},{sessions:[{date,session:{mode:'demo',metrics:{rmssd:30}}}],profile},{sessions,profile:{baselines:{sensor:[{...profile.baselines.sensor[0],version:'old'}]}}}])assert.deepEqual(classifyWeek({week,...input}).auto.body,[]);
});
test('user lines persist only to their week and are cleared with factor data; reads never seed storage',()=>{
 const previous=globalThis.localStorage,storage=new Map();let writes=0;
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>{writes++;storage.set(k,v);},removeItem:k=>storage.delete(k)};
 try{
  assert.deepEqual(loadInnerReview(),{});assert.equal(writes,0);
  saveReviewLine(week,'belief','My own words');saveReviewLine(week,'energy',{text:'A quiet walk',kind:'nourish'});
  assert.deepEqual([...storage.keys()],['mond-inner-review']);
  const entries=loadInnerReview();assert.equal(classifyWeek({week,entries}).user.belief[0].text,'My own words');
  assert.deepEqual(classifyWeek({week:'2026-W46',entries}).user.belief,[]);
  clearAllFactorData();assert.deepEqual(loadInnerReview(),{});
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
test('review deep links reveal the sensor-free page with empty storage and no writes',async()=>{
 const names=['document','window','location','localStorage'],previous=Object.fromEntries(names.map(k=>[k,globalThis[k]])),listeners=new Map(),elements=new Map();
 const node=()=>({hidden:true,value:'en',textContent:'',focus(){},addEventListener(){}});
 const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
 const host=get('review-view'),home=get('home-view');home.hidden=false;host.querySelector=()=>node();host.querySelectorAll=()=>[];
 globalThis.document={getElementById:get,documentElement:{lang:'en'},querySelectorAll:()=>[home,host]};
 globalThis.window={addEventListener:(event,fn)=>listeners.set(event,fn)};globalThis.location={hash:'#review'};
 globalThis.localStorage={getItem:()=>null,setItem:()=>assert.fail('Opening review must not write storage')};
 try{
  await import('../assets/review.js?test');await new Promise(resolve=>queueMicrotask(resolve));
  assert.equal(host.hidden,false);assert.equal(home.hidden,true);assert.match(host.innerHTML,/href="#feel"/);assert.match(host.innerHTML,/data-column="step"/);
  home.hidden=false;host.hidden=true;listeners.get('hashchange')();await new Promise(resolve=>queueMicrotask(resolve));assert.equal(host.hidden,false);assert.equal(home.hidden,true);
 }finally{for(const [k,v] of Object.entries(previous))if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
});

test('journal pane defaults from week data and respects explicit choices',()=>{
 assert.equal(journalPane({weekHasData:false}),'timeline');
 assert.equal(journalPane({weekHasData:true}),'review');
 for(const stored of ['timeline','review'])for(const weekHasData of [true,false])assert.equal(journalPane({stored,weekHasData}),stored);
 assert.equal(journalPane({stored:'invalid',weekHasData:true}),'review');
});
test('saving an emotion in the current ISO week fills the emotion band',()=>{
 const previous=globalThis.localStorage,storage=new Map();
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 try{
  const currentWeek=isoWeekKey();
  assert.equal(classifyWeek({week:currentWeek,emotions:loadEmotions()}).empty,true);
  addEmotion({path:[{id:'joy'}],note:'A little brightness'});
  const model=classifyWeek({week:currentWeek,emotions:loadEmotions()});
  assert.equal(model.empty,false);assert.ok(model.auto.emotion.some(x=>x.id==='joy'));assert.ok(model.auto.emotion.some(x=>x.text==='A little brightness'));
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
test('embedded review updates live, toggles the whole timeline, and remembers choices',async()=>{
 const names=['document','window','location','localStorage'],previous=Object.fromEntries(names.map(k=>[k,globalThis[k]]));
 const listeners=new Map(),elements=new Map(),storage=new Map();
 const node=()=>({hidden:true,value:'en',textContent:'',focus(){},addEventListener(){},querySelector:()=>node(),querySelectorAll:()=>[]});
 const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
 const timeline=get('journal-timeline'),review=get('journal-review'),toggle=get('journal-pane-toggle');
 const buttons=['timeline','review'].map(pane=>({...node(),dataset:{pane}}));
 toggle.querySelectorAll=()=>buttons;toggle.querySelector=()=>buttons[0];
 globalThis.document={getElementById:get,documentElement:{lang:'en'},querySelectorAll:()=>[get('home-view'),get('journal-view'),get('review-view')]};
 globalThis.window={addEventListener:(event,fn)=>listeners.set(event,fn),dispatchEvent:event=>listeners.get(event.type)?.(event)};
 globalThis.location={hash:'#journal'};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 const flush=()=>new Promise(resolve=>queueMicrotask(resolve));
 try{
  await import('../assets/review.js?journal-test');await flush();
  assert.equal(timeline.hidden,false);assert.equal(review.hidden,true);assert.equal(storage.size,0);
  addEmotion({path:[{id:'joy'}],note:'Freshly saved'});await flush();
  assert.equal(timeline.hidden,true);assert.equal(review.hidden,false);assert.match(review.innerHTML,/Freshly saved/);
  buttons[0].onclick();assert.equal(timeline.hidden,false);assert.equal(review.hidden,true);assert.equal(storage.get('mond-journal-pane'),'timeline');
  buttons[1].onclick();assert.equal(timeline.hidden,true);assert.equal(review.hidden,false);assert.equal(storage.get('mond-journal-pane'),'review');
  saveReviewLine(isoWeekKey(),'belief','My new words');await flush();assert.match(review.innerHTML,/My new words/);
  assert.match(review.innerHTML,/id="journal-review-emotion-title"/);
  storage.set('mond-journal-pane','timeline');listeners.get('storage')({});await flush();assert.equal(review.hidden,true);assert.equal(timeline.hidden,false);
  globalThis.location.hash='#journal-view';listeners.get('hashchange')({});await flush();assert.equal(timeline.hidden,false);
 }finally{for(const [k,v] of Object.entries(previous))if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
});
