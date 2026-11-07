import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
const [lang='en',hash='settings']=process.argv.slice(2);
const root=process.env.MOND_RUNTIME_ROOT?new URL(process.env.MOND_RUNTIME_ROOT+'/','file:'):new URL('../',import.meta.url);
const dom=new JSDOM(await readFile(new URL('index.html',root),'utf8'),{url:`https://diamondcao1996.github.io/mond-night-preview/#${hash}`,pretendToBeVisual:true});
const {window}=dom,{document}=window;
window.localStorage.setItem('mond-language',lang);
window.localStorage.setItem('care-preserve-sentinel','existing data');
const removed=[];const remove=window.Storage.prototype.removeItem;window.Storage.prototype.removeItem=function(k){removed.push(k);return remove.call(this,k);};
window.Storage.prototype.clear=function(){throw Error('storage wipe');};
for(const key of ['window','document','location','localStorage','sessionStorage','MutationObserver','Node','NodeFilter','Event','CustomEvent','HTMLElement','HTMLInputElement','HTMLSelectElement','FormData','FileReader'])Object.defineProperty(globalThis,key,{value:window[key],configurable:true,writable:true});
window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
window.HTMLMediaElement.prototype.play=async function(){Object.defineProperty(this,'paused',{value:false,configurable:true});this.dispatchEvent(new window.Event('play'));};
window.HTMLMediaElement.prototype.pause=function(){Object.defineProperty(this,'paused',{value:true,configurable:true});this.dispatchEvent(new window.Event('pause'));};
window.HTMLMediaElement.prototype.load=function(){};
const intervals=[];globalThis.setInterval=(...args)=>{intervals.push(args);return intervals.length;};
// Native imports execute the actual module graph, preserving query identity and order.
for(const script of document.querySelectorAll('script[type="module"][src]'))await import(new URL(script.getAttribute('src'),root));
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setTimeout(r,0));};
await settle();
const $=id=>document.getElementById(id);
const navIds=['home','rhythm','tools','journal','settings'];
const labels={en:['Home','Nights & rhythm','Toolbox','My dashboard','Settings'],'zh-CN':['首页','夜晚与节奏','工具箱','我的看板','设置'],sv:['Hem','Nätter & rytm','Verktygslåda','Min översikt','Inställningar']};
const checkLabels=l=>{assert.deepEqual([...document.querySelectorAll('nav [data-view]')].map(n=>n.dataset.view),navIds);for(const [i,id]of navIds.entries())assert.equal(document.querySelector(`nav [data-view="${id}"] span:last-child`).textContent,labels[l][i]);for(const b of document.querySelectorAll('nav [data-view]'))assert.equal(b.getAttribute('aria-label'),b.querySelector('span:last-child').textContent);};
const navigate=async route=>{window.location.hash=route;await settle();};
const visible=id=>{assert.equal($(id+'-view').hidden,false,id);assert.deepEqual([...document.querySelectorAll('.view')].filter(n=>!n.hidden).map(n=>n.id),[id+'-view']);};
checkLabels(lang);
for(const selector of ['#baseline-dialog','.support-settings','.animal-picker'])assert.equal(document.querySelectorAll(selector).length,1,`single module initialization: ${selector}`);
const baseline=$('open-baseline'),connect=$('companion-connect'),quiet=$('quiet-mobile'),preference=document.querySelector('.support-settings input');
assert.ok(baseline&&connect&&preference);assert.equal(typeof baseline.onclick,'function');assert.equal(typeof connect.onclick,'function');assert.equal(typeof preference.onchange,'function');
const home=$('home-view').innerHTML;
const care=$('home-care'),detail=care.querySelector('.companion-detail'),careHeading=care.querySelector('h2');assert.ok(detail.querySelector('p').textContent.length>20);assert.ok(care.querySelector('a[href="#feel"]'));assert.equal(care.contains(connect),false);
if(['care','care-view','companion','companion-view'].includes(hash)){assert.equal(document.activeElement,care);assert.equal($('home-view').hidden,false);}
const music=$('music-card'),support=$('support-card');
assert.ok(music&&support);
const checkUtilities=()=>{
 for(const [node,group] of [[music,'music'],[support,'support']]){
  assert.equal($(node.id),node);assert.equal(document.querySelectorAll('#'+node.id).length,1);
  assert.equal($('home-view').contains(node),false);
  assert.equal($('settings-'+group).contains(node),true);
 }
};
if(!['music','context'].includes(hash))checkUtilities();

for(const l of ['zh-CN','sv','en',lang]){
 $('language').value=l;$('language').dispatchEvent(new window.Event('change'));await settle();checkLabels(l);
 for(const route of ['home','settings','companion','companion-view','care-view','factors','device','preferences','baseline','care','tools','journal','rhythm','night','relax','feel','forest','safe-space','box-breathing','review']){
  await navigate(route);
  const expected={factors:'settings',device:'settings',preferences:'settings',baseline:'settings',care:'home',companion:'home','care-view':'home','companion-view':'home',night:'rhythm'}[route]||route;visible(expected);checkLabels(l);checkUtilities();
  if(['care','care-view','companion','companion-view'].includes(route)){assert.equal(document.activeElement,$('home-care'));assert.equal(document.querySelector('nav [aria-current=page]').dataset.view,'home');}
  if(expected==='settings'){
   assert.equal($('settings-controls').contains(connect),true);assert.equal($('settings-controls').contains(baseline),true);assert.equal($('settings-controls').contains(preference),true);
   assert.equal($('factors-view').hidden,route!=='factors');
   if(route==='factors'){assert.ok($('f-profile'));assert.equal(typeof $('f-profile').onsubmit,'function');assert.equal(typeof $('f-import-button').onclick,'function');}
  }
 }
}
await navigate('settings');connect.click();assert.equal($('connect-dialog').open,true);$('connect-dialog').close();baseline.click();assert.equal($('baseline-dialog').open,true);$('baseline-dialog').close();
const was=quiet.getAttribute('aria-pressed');quiet.click();assert.notEqual(quiet.getAttribute('aria-pressed'),was);
const storedBefore=JSON.stringify({...window.localStorage});const checked=preference.checked;preference.checked=!checked;preference.dispatchEvent(new window.Event('change'));await settle();assert.equal(preference.checked,!checked);assert.notEqual(JSON.stringify({...window.localStorage}),storedBefore);
$('pause-length').value='120';$('pause-length').dispatchEvent(new window.Event('change'));await settle();assert.equal($('pause-length').value,'120');
// Reproduce an old router exposing home before the final lifecycle pass.
$('settings-view').hidden=true;$('home-view').hidden=false;
window.dispatchEvent(new window.Event('mond-tools-ready'));await settle();visible('settings');
assert.equal($('open-baseline'),baseline);assert.equal($('companion-connect'),connect);assert.equal(document.querySelector('.support-settings input'),preference);
assert.equal(document.querySelectorAll('#companion-view').length,0);assert.equal(document.querySelectorAll('#settings-view').length,1);
await navigate('home');assert.ok($('home-view').querySelector('.hero'));assert.ok($('home-view').querySelector('.device-card'));assert.ok(home.includes('pet-scene'));assert.ok($('home-view').querySelector('.baseline-card'));checkUtilities();
const activity=$('activity'),length=$('pause-length'),activityValue=activity.value;
assert.equal(typeof activity.onchange,'function');
const audio=$('mond-audio'),volume=$('music-volume'),play=$('music-play'),pause=$('music-pause'),auto=$('music-auto');
const handlers=[play.onclick,pause.onclick,volume.oninput,auto.onchange];
assert.ok(handlers.every(h=>typeof h==='function'));
volume.value='37';volume.dispatchEvent(new window.Event('input'));volume.dispatchEvent(new window.Event('change'));await settle();
assert.equal(audio.volume,0.37);
play.click();await settle();assert.equal(audio.paused,false);pause.click();await settle();assert.equal(audio.paused,true);

for(const route of ['music','context','music','context']){
 await navigate(route);visible('tool-focus');
 const node=route==='music'?music:support;
 assert.equal($('tool-focus-view').firstElementChild,node);
 window.dispatchEvent(new window.Event('mond-data-change'));await settle();
 assert.equal($('tool-focus-view').contains(node),true);
 $('language').value='sv';$('language').dispatchEvent(new window.Event('change'));await settle();
 assert.equal($('tool-focus-view').contains(node),true);
 assert.equal($('activity'),activity);assert.equal(activity.value,activityValue);
 assert.equal($('pause-length'),length);assert.equal(length.value,'120');
 assert.equal($('mond-audio'),audio);assert.equal(audio.volume,0.37);
 assert.deepEqual([play.onclick,pause.onclick,volume.oninput,auto.onchange],handlers);
 assert.ok($('suggestions').children.length);

 await navigate('tools');checkUtilities();await navigate('settings');checkUtilities();
}
assert.equal($('home-care'),care);assert.equal(care.querySelector('.companion-detail'),detail);assert.equal(care.querySelector('h2'),careHeading);assert.equal(window.localStorage.getItem('care-preserve-sentinel'),'existing data');assert.deepEqual(removed,[]);
console.log(`production lifecycle passed ${lang} #${hash}`);dom.window.close();process.exit(0);
