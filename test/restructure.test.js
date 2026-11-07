import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BOARD_KEY,loadBoards,themes,updateBoard,persistBoard,progress} from '../assets/engine/boards.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {TOOLS} from '../assets/engine/toolbox.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {viewForHash,SENSOR_FREE_VIEWS} from '../assets/engine/routes.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {loadEmotions,loadLogs,loadNights} from '../assets/engine/store.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
const storage=()=>{const map=new Map();return {map,writes:0,getItem:k=>map.get(k)??null,setItem(k,v){this.writes++;map.set(k,v);},removeItem:k=>map.delete(k)};};
const change=(m,op,p,c)=>updateBoard(m,op,p,c);

test('records aliases retain journal and review; night/rhythm aliases share destination',()=>{
 for(const hash of ['journal','journal-view','dashboard','vision','actions'])assert.equal(viewForHash('#'+hash,null),'journal');
 assert.equal(viewForHash('#review',null),'review');
 for(const hash of ['night','night-view','nights','rhythm','rhythm-view','live'])assert.equal(viewForHash('#'+hash,null),'rhythm');
});
test('tool inventory includes all five care tools and all existing companion utilities',()=>{
 assert.deepEqual(TOOLS.map(x=>x.route),['feel','forest','safe-space','box-breathing','relax','pause','music','context','baseline']);
 for(const tool of TOOLS){assert.equal(tool.titles.length,3);assert.equal(tool.descriptions.length,3);assert.notEqual(viewForHash('#'+tool.route,null),'home');}
 assert.ok(SENSOR_FREE_VIEWS.includes('tools'));
});
test('empty storage presents six editable templates in all languages with no seed writes',()=>{
 const s=storage(),m=loadBoards(s);
 for(const lang of ['zh','en','sv']){assert.equal(themes(m,lang).length,6);assert.ok(themes(m,lang).every(v=>v.text===''));}
 assert.equal(s.writes,0);assert.deepEqual(m.actions,[]);assert.equal(progress(m).total,0);
});
test('unavailable, corrupt and malformed storage recover without writes',()=>{
 for(const bad of ['broken','null','[]','{"version":1,"visions":null,"actions":{}}']){const s=storage();s.map.set(BOARD_KEY,bad);assert.deepEqual(loadBoards(s).actions,[]);assert.equal(s.writes,0);}
 assert.deepEqual(loadBoards({getItem(){throw Error('blocked');}}).visions,[]);
 const s=storage();s.map.set(BOARD_KEY,JSON.stringify({version:1,visions:[null,{}],actions:[null,{}]}));assert.deepEqual(loadBoards(s).actions,[]);
});
test('vision title and present-tense text create and edit persist after reload',()=>{
 const s=storage();let m=change(loadBoards(s),'vision',{id:'theme-2',title:'My garden',text:'I am growing herbs each morning.'});persistBoard(m,s);
 m=loadBoards(s);assert.equal(themes(m)[2].title,'My garden');m=change(m,'vision',{id:'theme-2',title:'Our home',text:'I am sharing breakfast.'});persistBoard(m,s);
 assert.equal(loadBoards(s).visions.length,1);assert.equal(themes(loadBoards(s))[2].text,'I am sharing breakfast.');
});
test('actions create, edit and relink without losing completed state after reload',()=>{
 const s=storage();let m=change(loadBoards(s),'action',{id:'a1',visionId:'theme-0',text:'Stretch for one minute'});
 m=change(m,'complete',{id:'a1',completed:true});m=change(m,'action',{id:'a1',visionId:'theme-4',text:'Rest for one minute'});persistBoard(m,s);
 const a=loadBoards(s).actions[0];assert.deepEqual(a,{id:'a1',visionId:'theme-4',text:'Rest for one minute',completed:true});
});
test('progress counts completed actions meaningfully overall and by linked theme after reload',()=>{
 const s=storage();let m=loadBoards(s);for(let i=0;i<3;i++)m=change(m,'action',{id:'a'+i,visionId:'theme-'+i,text:'Small step'});
 m=change(m,'complete',{id:'a1',completed:true});persistBoard(m,s);m=loadBoards(s);
 assert.deepEqual(progress(m),{done:1,total:3});assert.deepEqual(progress(m,'theme-1'),{done:1,total:1});
 m=change(m,'complete',{id:'a1',completed:false});assert.deepEqual(progress(m),{done:0,total:3});
});
test('cancelled action deletion preserves object and storage; confirmed deletion persists',()=>{
 const s=storage(),m=change(loadBoards(s),'action',{id:'a',visionId:'theme-0',text:'Step'});persistBoard(m,s);let calls=0;
 assert.equal(change(m,'deleteAction',{id:'a'},()=>{calls++;return false;}),m);assert.equal(calls,1);assert.equal(loadBoards(s).actions.length,1);
 persistBoard(change(m,'deleteAction',{id:'a'},()=>true),s);assert.equal(loadBoards(s).actions.length,0);
});
test('vision clearing confirms cascade and cancelled clearing keeps linked actions',()=>{
 const s=storage();let m=change(loadBoards(s),'vision',{id:'theme-0',title:'Care',text:'I am cared for'});m=change(m,'action',{id:'a',visionId:'theme-0',text:'One step'});m=change(m,'action',{id:'b',visionId:'theme-1',text:'Another step'});
 assert.equal(change(m,'deleteVision',{id:'theme-0'},()=>false),m);
 persistBoard(change(m,'deleteVision',{id:'theme-0'},()=>true),s);m=loadBoards(s);assert.equal(m.visions.length,0);assert.equal(m.actions[0].id,'b');assert.equal(m.actions.length,1);
});
test('optional daily/weekly and desired-self reflections survive reload',()=>{
 const s=storage();for(const cadence of ['daily','weekly']){persistBoard(change(loadBoards(s),'reflection',{cadence,reflection:'A quiet walk helped.',desiredSelf:'I make room to rest.'}),s);const m=loadBoards(s);assert.equal(m.cadence,cadence);assert.equal(m.reflection,'A quiet walk helped.');assert.equal(m.desiredSelf,'I make room to rest.');}
});
test('board CRUD never modifies existing moods, sessions, imported nights or logs',()=>{
 const s=storage(),old=globalThis.localStorage;globalThis.localStorage=s;
 const records={'mond-factors-emotions':[{id:'mood',note:'Keep me'}],'mond-sessions':[{id:'session',note:'Keep me'}],'mond-factors-logs':[{date:'2026-11-01',types:['rest']}],'mond-factors-nights':[{date:'2026-11-01',events:[],device:'wearable',metric:'RMSSD',window:'overnight',quality:'good',hrvRmssdMs:40}]};
 try{for(const [k,v] of Object.entries(records))s.map.set(k,JSON.stringify(v));let m=change(loadBoards(s),'vision',{id:'theme-0',title:'Rest',text:'I rest.'});m=change(m,'action',{id:'a',visionId:'theme-0',text:'Pause'});persistBoard(change(m,'deleteVision',{id:'theme-0'},()=>true),s);
 for(const [k,v]of Object.entries(records))assert.deepEqual(JSON.parse(s.getItem(k)),v);assert.deepEqual(loadEmotions(),records['mond-factors-emotions']);assert.deepEqual(loadLogs(),records['mond-factors-logs']);assert.deepEqual(loadNights(),records['mond-factors-nights']);
 }finally{if(old===undefined)delete globalThis.localStorage;else globalThis.localStorage=old;}
});
test('quota failures are exposed and cannot mutate the previous model',()=>{
 const m=loadBoards(storage()),next=change(m,'vision',{id:'theme-0',title:'New',text:'I am here.'});
 assert.throws(()=>persistBoard(next,{setItem(){throw Error('quota');}}),/quota/);assert.equal(m.visions.length,0);
});
test('invalid action linkage and blank actions cannot create orphan records',()=>{
 const m=loadBoards(storage());assert.throws(()=>change(m,'action',{visionId:'missing',text:'Step'}));assert.throws(()=>change(m,'action',{visionId:'theme-0',text:'  '}));
});

test('merged source retains live controls, charts, connect, import, forecast and night rendering',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');const night=await readFile(new URL('../assets/night.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca',import.meta.url),'utf8');const overlay=await readFile(new URL('../assets/restructure.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca',import.meta.url),'utf8');const factors=await readFile(new URL('../assets/factors.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca',import.meta.url),'utf8');
 const merged=html.slice(html.indexOf('<section id="rhythm-view"'),html.indexOf('<section id="relax-view"'));
 for(const id of ['merged-nav','live-section','chart2','duration','event-count','altered','sdnn','save-session','stop','export-live','night-view'])assert.ok(merged.includes(`id="${id}"`),id);
 assert.ok(!html.includes('id="night-view" class="view"'));assert.match(night,/runCAS/);assert.match(night,/loadNights/);assert.match(night,/#rhythm-view/);assert.match(overlay,/\['factors'.*Import & data/);assert.match(factors,/f-import-button/);
 for(const id of ['connect-top','connect-card','dialog-demo','scan'])assert.ok(html.includes(`id="${id}"`));
});
test('dashboard wiring separates toolbox from records and retains mood delete confirmation',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');const overlay=await readFile(new URL('../assets/restructure.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca',import.meta.url),'utf8');const feelings=await readFile(new URL('../assets/feelings.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca',import.meta.url),'utf8');const review=await readFile(new URL('../assets/review.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca',import.meta.url),'utf8');
 assert.match(html,/data-view="tools"/);assert.match(html,/data-view="journal"/);assert.match(html,/id="dashboard-boards"/);assert.match(overlay,/href="#\$\{tool.route\}"/);assert.match(html,/id="toolbox-return"[^>]*href="#tools"/);
 assert.match(overlay,/form\.onsubmit/);assert.match(overlay,/commit\('vision'/);assert.match(overlay,/commit\('action'/);assert.match(overlay,/commit\('complete'/);assert.match(overlay,/commit\('reflection'/);assert.match(overlay,/window.confirm/);
 assert.match(review,/window.confirm\(deletion\[lang\].confirm\)/);assert.match(review,/review-mood-note/);assert.match(feelings,/location.hash!=='#feel'\?`<article class="card emotion-panel"><h2>\$\{t.history\}/);
});

test('sensor-free toolbox and dashboard route chrome run with empty storage using existing Node harness',async()=>{
 const previous=Object.fromEntries(['document','window','location','localStorage'].map(k=>[k,globalThis[k]]));const s=storage(),elements=new Map();
 const node=id=>({id,hidden:true,innerHTML:'',textContent:'',value:'en',querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},prepend(){},classList:{toggle(){}},scrollIntoView(){}});
 const get=id=>{if(!elements.has(id))elements.set(id,node(id));return elements.get(id);};
 globalThis.document={getElementById:get,documentElement:{lang:'en'},querySelector:()=>null,querySelectorAll:selector=>selector==='.view'?[...elements.values()].filter(n=>n.id.endsWith('-view')):[],createElement:()=>node('new')};
 globalThis.window={addEventListener(){}};globalThis.localStorage=s;globalThis.location={hash:'#tools'};
 try{
 await import('../assets/restructure.js?toolbox-node-harness');await new Promise(resolve=>queueMicrotask(resolve));assert.equal(get('tools-view').hidden,false);assert.equal(get('page-title').textContent,'Toolbox');for(const tool of TOOLS)assert.ok(get('tools-view').innerHTML.includes(`href="#${tool.route}"`));assert.equal(s.writes,0);
 globalThis.location.hash='#journal';await import('../assets/restructure.js?dashboard-node-harness');await new Promise(resolve=>queueMicrotask(resolve));assert.equal(get('journal-view').hidden,false);assert.equal(get('tools-view').hidden,true);assert.equal(get('dashboard-boards').hidden,true);assert.match(get('dashboard-nav').innerHTML,/#review/);assert.equal(s.writes,0);
 }finally{for(const [k,v]of Object.entries(previous)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});
