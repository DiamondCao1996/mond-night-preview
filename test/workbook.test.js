import test from 'node:test';
import assert from 'node:assert/strict';
import {WORKBOOK_TOOLS,PRACTICE_KEY,loadPractices,savePractice} from '../assets/engine/workbook.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
test('all original digital tools have distinct trilingual instructions and no seed writes',()=>{
 const s=storage();assert.equal(WORKBOOK_TOOLS.length,12);assert.equal(new Set(WORKBOOK_TOOLS.map(t=>t.route)).size,12);
 for(const t of WORKBOOK_TOOLS){assert.equal(t.titles.length,3);assert.equal(t.descriptions.length,3);assert.ok(t.steps.length>=2);for(const step of t.steps){assert.equal(step.length,3);assert.ok(step.every(v=>v.length>8));}}
 assert.deepEqual(loadPractices(s),[]);assert.equal(s.getItem(PRACTICE_KEY),null);
});
test('practice persistence appends optional empty notes and preserves all existing unrelated data',()=>{
 const s=storage();s.setItem('mond-sessions','keep');for(const t of WORKBOOK_TOOLS){const r=savePractice({route:t.route,notes:[],skipped:[0]},s);assert.equal(loadPractices(s).at(-1).id,r.id);assert.equal(r.notes.length,0);}assert.equal(loadPractices(s).length,12);assert.equal(s.getItem('mond-sessions'),'keep');
});
test('corrupt history and quota errors cannot overwrite prior data or report a save',()=>{
 const s=storage();for(const bad of ['{oops','{}','null']){s.setItem(PRACTICE_KEY,bad);assert.deepEqual(loadPractices(s),[]);assert.throws(()=>savePractice({route:'senses',notes:[]},s));assert.equal(s.getItem(PRACTICE_KEY),bad);}
 assert.throws(()=>savePractice({route:'senses',notes:[]},{getItem:()=>null,setItem(){throw Error('quota');}}),/quota/);
 for(const bad of [{route:'missing'}, {route:'senses',notes:[3]}, {route:'senses',skipped:[-1]}])assert.throws(()=>savePractice(bad,s));
});
for(const [lang,route]of [['zh-CN','senses'],['en','stop'],['sv','rain']])test(`actual production tools/save/recommendation lifecycle ${lang} deep link #${route}`,async()=>{
 const {stdout,stderr}=await run(process.execPath,[new URL('../test-support/workbook-runtime-fixture.mjs',import.meta.url).pathname,lang,route],{timeout:30000});assert.match(stdout,/workbook production lifecycle passed/);assert.equal(stderr,'');
});

test('production entry graph reload restores saved notes without rewriting data',async()=>{
 const records=[{id:'before-reload',utc:new Date().toISOString(),route:'reframe',notes:['saved before reload'],skipped:[]}];
 const {stdout,stderr}=await run(process.execPath,[new URL('../test-support/workbook-runtime-fixture.mjs',import.meta.url).pathname,'en','reframe'],{env:{...process.env,MOND_PRACTICE_RELOAD:JSON.stringify(records)},timeout:30000});assert.match(stdout,/workbook production reload passed/);assert.equal(stderr,'');
});
