import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
const [lang='en',hash='settings']=process.argv.slice(2);
const root=process.env.MOND_RUNTIME_ROOT?new URL(process.env.MOND_RUNTIME_ROOT+'/','file:'):new URL('../',import.meta.url);
const dom=new JSDOM(await readFile(new URL('index.html',root),'utf8'),{url:`https://diamondcao1996.github.io/mond-night-preview/?bridge=1#${hash}`,pretendToBeVisual:true});
const {window}=dom,{document}=window;
window.localStorage.setItem('mond-language',lang);
window.localStorage.setItem('care-preserve-sentinel','existing data');
const removed=[];const remove=window.Storage.prototype.removeItem;window.Storage.prototype.removeItem=function(k){removed.push(k);return remove.call(this,k);};
window.Storage.prototype.clear=function(){throw Error('storage wipe');};
for(const key of ['window','document','location','localStorage','sessionStorage','MutationObserver','Node','NodeFilter','Event','CustomEvent','HTMLElement','HTMLInputElement','HTMLSelectElement','FormData','FileReader'])Object.defineProperty(globalThis,key,{value:window[key],configurable:true,writable:true});
window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
window.HTMLMediaElement.prototype.play=async function(){Object.defineProperty(this,'paused',{value:false,configurable:true});this.dispatchEvent(new window.Event('play'));};
window.HTMLMediaElement.prototype.pause=function(){Object.defineProperty(this,'paused',{value:true,configurable:true});this.dispatchEvent(new window.Event('pause'));};
window.HTMLMediaElement.prototype.load=function(){};
const intervals=[];globalThis.setInterval=(...args)=>{intervals.push(args);return intervals.length;};
let bridgeCurrent,bridgeSaved=[],failSave=false;
const now=Date.now();
const sensor=(value=40,id='current')=>({session_id:id,device:'MOND-test',mode:'sensor',status:'connected',stale:false,warming:false,processing_version:'mond-causal-1.1',elapsed:180,metrics:{rmssd:value,sdnn:30,hr:70},events:181,series:Array.from({length:181},(_,i)=>({time_s:i,event_index:i,corrected_ms:800+(i%2?value:0),action:'unchanged'}))});
bridgeCurrent=sensor();
const realFetch=globalThis.fetch;globalThis.fetch=async(path,options)=>{
 const url=String(path);let data;
 if(url==='/api/config')data={token:'fixture-only'};
 else if(url==='/api/state')data=bridgeCurrent;
 else if(url==='/api/sessions')data=bridgeSaved.map(m=>({...m,session:{...m.session,series:undefined}}));
 else if(url==='/api/save'){if(failSave)return {ok:false,json:async()=>({error:'fixture rejected save'})};const payload=JSON.parse(options.body);data={id:crypto.randomUUID(),saved_at:Date.now()/1000,session:structuredClone(bridgeCurrent),note:payload.note};bridgeSaved.push(data);}
 else data={};
 return {ok:true,json:async()=>data};
};
window.localStorage.setItem('mond-profile',JSON.stringify({schema:1,animal:'bunny',activity:'work',allowed:['task','quiet','pause'],seconds:60,feedback:[],baselines:{sensor:[{id:'quiet',device:'MOND-test',mode:'sensor',saved_at:now-60000,window:180,version:'mond-causal-1.1',altered:0,stats:{rmssd_ms:40,sdnn_ms:30,mean_hr_bpm:70,successive_pairs:180}}],demo:[]}}));
if(process.env.MOND_PRACTICE_RELOAD)window.localStorage.setItem('mond-workbook-practices',process.env.MOND_PRACTICE_RELOAD);
// Native imports execute the actual module graph, preserving query identity and order.
for(const script of document.querySelectorAll('script[type="module"][src]'))await import(new URL(script.getAttribute('src'),root));
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setTimeout(r,0));};
await settle();
const $=id=>document.getElementById(id);

const stamp=document.querySelector('script[src*="/workbook.js"]').src.split('?v=')[1];
const moduleURL=path=>new URL(path+(stamp?'?v='+stamp:''),root);
const {WORKBOOK_TOOLS,loadPractices,PRACTICE_KEY}=await import(moduleURL('assets/engine/workbook.js'));
const navIds=['home','rhythm','tools','journal','settings'];
const navigate=async route=>{window.location.hash=route;await settle();};
const visible=route=>{assert.deepEqual([...document.querySelectorAll('.view')].filter(n=>!n.hidden).map(n=>n.id),[route+'-view']);};
assert.deepEqual([...document.querySelectorAll('nav [data-view]')].map(n=>n.dataset.view),navIds);
if(process.env.MOND_PRACTICE_RELOAD){
 visible(hash);const original=localStorage.getItem(PRACTICE_KEY);assert.equal($(hash+'-view').querySelectorAll('.practice-note').length,1);assert.match($(hash+'-view').textContent,/saved before reload/);
 await navigate('home');await navigate(hash);$('language').value='sv';$('language').dispatchEvent(new window.Event('change'));await settle();assert.equal($(hash+'-view').querySelectorAll('.practice-note').length,1);assert.equal(localStorage.getItem(PRACTICE_KEY),original);console.log('workbook production reload passed');dom.window.close();process.exit(0);
}
assert.equal(localStorage.getItem(PRACTICE_KEY),null);
// Deep-link startup uses actual HTML imports, not directly imported UI render functions.
visible(hash);
const initialKeys=Object.keys(localStorage);
for(const tool of WORKBOOK_TOOLS){
 await navigate(tool.route);visible(tool.route);const host=$(tool.route+'-view');
 assert.match(host.textContent,new RegExp(tool.titles[lang==='zh-CN'?0:lang==='sv'?2:1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.equal(host.querySelectorAll('[data-next]').length,1);
 host.querySelector('[data-next]').click();await settle();
 host.querySelector('textarea').value='draft should not save';host.querySelector('textarea').dispatchEvent(new window.Event('input'));
 await navigate('tools');assert.equal(localStorage.getItem(PRACTICE_KEY),null);
}
assert.deepEqual(Object.keys(localStorage),initialKeys);
for(const tool of WORKBOOK_TOOLS){
 await navigate(tool.route);const host=$(tool.route+'-view');host.querySelector('[data-next]').click();await settle();
 // Locale changes and refresh events preserve the current step and draft.
 const text=host.querySelector('textarea');text.value='my own <quiet> note';text.dispatchEvent(new window.Event('input'));
 const prior=$('language').value;$('language').value=prior==='sv'?'en':'sv';$('language').dispatchEvent(new window.Event('change'));await settle();assert.equal(host.querySelector('textarea').value,'my own <quiet> note');
 $('language').value=prior;$('language').dispatchEvent(new window.Event('change'));await settle();
 for(let i=0;i<tool.steps.length-1;i++){host.querySelector('[data-next]').click();await settle();}
 const count=loadPractices().length;host.querySelector('[data-save]').click();await settle();assert.equal(loadPractices().length,count+1);assert.equal(loadPractices().at(-1).route,tool.route);assert.equal(loadPractices().at(-1).notes[0],'my own <quiet> note');assert.equal(host.querySelector('.practice-note quiet'),null);
 await navigate('home');await navigate(tool.route);assert.equal(host.querySelectorAll('.practice-note').length,1);
 host.querySelector('[data-next]').click();await settle();for(let i=0;i<tool.steps.length-1;i++){host.querySelector('[data-skip]').click();await settle();}
 host.querySelector('[data-finish]').click();await settle();assert.equal(loadPractices().length,count+1);
}
await navigate('tools');visible('tools');assert.equal(document.querySelectorAll('.tool-group').length,4);assert.equal(document.querySelectorAll('#tool-recommendation .path-primary').length,1);
for(const state of ['tense','low','scattered','numb','okay']){document.querySelector(`[data-state="${state}"]`).click();assert.equal(document.querySelectorAll('#tool-recommendation .path-primary').length,1);}
await navigate('support-now');visible('support-now');assert.equal(document.querySelectorAll('#support-now-view .path-primary').length,1);
for(const view of ['home','settings']){await navigate(view);assert.equal($('home-view').contains($('music-card')),false);assert.equal($('home-view').contains($('support-card')),false);assert.equal($('settings-music').contains($('music-card')),true);assert.equal($('settings-support').contains($('support-card')),true);}
// Actual save button -> bridge save result -> optional compass -> one unified recommendation.
const refreshLive=async()=>{for(const [callback,delay]of intervals)if(delay===1000)await callback();await settle();};
await refreshLive();
for(const [value,route]of [[10,'relax'],[40,'reframe'],[70,'actions']]){
 bridgeCurrent=sensor(value,'current-'+value);await refreshLive();$('save-session').click();assert.equal($('note-dialog').open,true);$('save-note').click();await settle();
 assert.equal(document.querySelectorAll('.moment-compass[open]').length,1);document.querySelector('.moment-compass [data-skip]').click();await settle();
 const dialog=document.querySelector('.care-path-dialog');assert.ok(dialog?.open);assert.equal(dialog.querySelectorAll('.path-primary').length,1);assert.equal(dialog.querySelector('.path-primary').hash,'#'+route);assert.equal(document.querySelectorAll('dialog[open]').length,1);
 dialog.querySelector('.path-primary').click();await settle();assert.equal(document.querySelector('.care-path-dialog'),null);
 if(route==='relax'){
  const host=$('relax-view');assert.ok(host.querySelector('[data-next]'));host.querySelector('[data-next]').click();
  for(let i=0;i<10;i++)for(let p=0;p<3;p++)host.querySelector('[data-next]').click();
  host.querySelector('[data-next]').click();host.querySelector('[data-next]').click();
  assert.equal(JSON.parse(localStorage.getItem('mond-factors-pmr')).at(-1).completedZoneIds.length,10);
 }
}
// The actual compass save overrides optimistic readings for an intense negative family.
bridgeCurrent=sensor(90,'intense-high');await refreshLive();$('save-session').click();$('save-note').click();await settle();
let compass=document.querySelector('.moment-compass');compass.querySelector('g[data-emotion="fear"]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));compass.querySelector('select').value='5';compass.querySelector('select').dispatchEvent(new window.Event('change'));compass.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();
assert.equal(document.querySelector('.care-path-dialog .path-primary').hash,'#safe-space');assert.equal(document.querySelectorAll('dialog[open]').length,1);document.querySelector('.care-path-dialog .path-primary').click();await settle();visible('safe-space');assert.equal(document.querySelector('.care-path-dialog'),null);
// Clear only test mood context to test quality abstention independently.
localStorage.setItem('mond-factors-emotions','[]');bridgeCurrent={...sensor(90,'poor'),stale:true};await refreshLive();$('save-session').click();$('save-note').click();await settle();document.querySelector('.moment-compass [data-skip]').click();await settle();assert.equal(document.querySelector('.care-path-dialog .path-primary').hash,'#senses');document.querySelector('.care-path-dialog button.text-button').click();await settle();
// Failed saves cannot create a second dialog or a new record.
await navigate('rhythm');await refreshLive();failSave=true;const before=bridgeSaved.length;$('save-session').click();$('save-note').click();await settle();assert.equal(bridgeSaved.length,before);assert.equal(document.querySelector('.care-path-dialog'),null);assert.equal(document.querySelector('.moment-compass'),null);$('note-dialog').close();
assert.equal(localStorage.getItem('care-preserve-sentinel'),'existing data');assert.deepEqual(removed,[]);
assert.equal(localStorage.getItem('mond-sessions'),null); // bridge records never need a local copy to trigger care
console.log('workbook production lifecycle passed '+lang);dom.window.close();globalThis.fetch=realFetch;process.exit(0);
