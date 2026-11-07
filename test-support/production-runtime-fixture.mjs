import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
const [lang='en',hash='settings']=process.argv.slice(2);
const root=process.env.MOND_RUNTIME_ROOT?new URL(process.env.MOND_RUNTIME_ROOT+'/','file:'):new URL('../',import.meta.url);
const dom=new JSDOM(await readFile(new URL('index.html',root),'utf8'),{url:`https://diamondcao1996.github.io/mond-night-preview/#${hash}`,pretendToBeVisual:true});
const {window}=dom,{document}=window;
window.localStorage.setItem('mond-language',lang);
for(const key of ['window','document','location','localStorage','sessionStorage','MutationObserver','Node','NodeFilter','Event','CustomEvent','HTMLElement','HTMLInputElement','HTMLSelectElement','FormData','FileReader'])Object.defineProperty(globalThis,key,{value:window[key],configurable:true,writable:true});
window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
const intervals=[];globalThis.setInterval=(...args)=>{intervals.push(args);return intervals.length;};
// Native imports execute the actual module graph, preserving query identity and order.
for(const script of document.querySelectorAll('script[type="module"][src]'))await import(new URL(script.getAttribute('src'),root));
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setTimeout(r,0));};
await settle();
const $=id=>document.getElementById(id);
const labels={en:['Home','Care & companion','Settings'], 'zh-CN':['首页','陪伴与关怀','设置'],sv:['Hem','Omsorg & sällskap','Inställningar']};
const checkLabels=l=>{for(const [i,id]of ['home','companion','settings'].entries())assert.equal(document.querySelector(`nav [data-view="${id}"] span:last-child`).textContent,labels[l][i]);};
const navigate=async route=>{window.location.hash=route;await settle();};
const visible=id=>{assert.equal($(id+'-view').hidden,false,id);assert.deepEqual([...document.querySelectorAll('.view')].filter(n=>!n.hidden).map(n=>n.id),[id+'-view']);};
checkLabels(lang);
for(const selector of ['#baseline-dialog','.support-settings','.animal-picker'])assert.equal(document.querySelectorAll(selector).length,1,`single module initialization: ${selector}`);
const baseline=$('open-baseline'),connect=$('companion-connect'),quiet=$('quiet-mobile'),preference=document.querySelector('.support-settings input');
assert.ok(baseline&&connect&&preference);assert.equal(typeof baseline.onclick,'function');assert.equal(typeof connect.onclick,'function');assert.equal(typeof preference.onchange,'function');
const home=$('home-view').innerHTML;
for(const l of ['zh-CN','sv','en',lang]){
 $('language').value=l;$('language').dispatchEvent(new window.Event('change'));await settle();checkLabels(l);
 for(const route of ['home','settings','companion','factors','device','preferences','baseline','care','tools','journal','rhythm','night','relax','feel','forest','safe-space','box-breathing','review']){
  await navigate(route);
  const expected={factors:'settings',device:'settings',preferences:'settings',baseline:'settings',care:'companion',night:'rhythm'}[route]||route;visible(expected);checkLabels(l);
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
assert.equal(document.querySelectorAll('#companion-view').length,1);assert.equal(document.querySelectorAll('#settings-view').length,1);
await navigate('home');assert.ok($('home-view').querySelector('.hero'));assert.ok($('home-view').querySelector('.device-card'));assert.ok(home.includes('pet-scene'));for(const selector of ['.baseline-card','#support-card','#music-card'])assert.ok($('home-view').querySelector(selector),selector);
console.log(`production lifecycle passed ${lang} #${hash}`);dom.window.close();process.exit(0);
