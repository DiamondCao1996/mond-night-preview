import test from 'node:test';
import assert from 'node:assert/strict';
import {SENSOR_FREE_VIEWS, viewForHash} from '../assets/engine/routes.js?v=135e68fba5df30ade5cd1920aef10d008822562c';

test('self-care routes open without a document, profile, sessions or sensor', () => {
 const previous = globalThis.localStorage;
 globalThis.localStorage = {getItem: () => null};
 try {
  for (const id of SENSOR_FREE_VIEWS) {
   assert.equal(viewForHash(`#${id}`, null), id);
   assert.equal(viewForHash(id, null), id);
  }
  assert.equal(viewForHash('#unknown', null), 'home');
  assert.equal(viewForHash('', null), 'home');
 } finally {
  if (previous === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previous;
 }
});

test('existing document views open even without a title registry entry', () => {
 const doc = {getElementById: id => id === 'future-care-view' ? {} : null};
 assert.equal(viewForHash('#future-care', doc), 'future-care');
 assert.equal(viewForHash('#missing', doc), 'home');
});

test('PMR deep link and hashchange reveal practice and hide home with empty storage', async () => {
 const previous = Object.fromEntries(['document','window','location','localStorage'].map(key => [key, globalThis[key]]));
 const listeners = new Map();
 const node = () => ({hidden:true, value:'en', textContent:'', addEventListener(){}, focus(){}});
 const elements = new Map();
 const get = id => {if (!elements.has(id)) elements.set(id,node()); return elements.get(id);};
 const host = get('relax-view'), home = get('home-view'), card = get('relax-open-home');
 home.hidden = false;
 host.querySelector = () => node();
 host.querySelectorAll = () => [];
 globalThis.document = {getElementById:get, documentElement:{lang:'en'}, querySelectorAll:() => [home,host], addEventListener(){}};
 globalThis.window = {addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);}};
 globalThis.location = {hash:'#relax'};
 globalThis.localStorage = {getItem:() => null};
 try {
  await import('../assets/pmr.js?routes-test');
  assert.match(host.innerHTML, /Begin practice/);
  assert.equal(host.hidden,false);
  assert.equal(home.hidden,true);
  assert.equal(card.hidden,false);
  assert.equal(card.textContent,'Take a moment to relax');
  // Simulate an older router revealing home before feature listeners run.
  home.hidden=false;host.hidden=true;
  for(const fn of listeners.get('hashchange')) fn();
  await new Promise(resolve => queueMicrotask(resolve));
  assert.match(host.innerHTML,/Begin practice/);
  assert.equal(host.hidden,false);
  assert.equal(home.hidden,true);
  assert.equal(card.hidden,false);
 } finally {
  for(const [key,value] of Object.entries(previous)) {
   if(value===undefined) delete globalThis[key];else globalThis[key]=value;
  }
 }
});

test('inline cache guard reloads at most once per stamp and tolerates offline fetch', async () => {
 const {readFile} = await import('node:fs/promises');
 const {runInNewContext} = await import('node:vm');
 const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
 const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const currentStamp=html.match(/window\.__MOND_V = '([^']+)'/)[1];
 const storage = new Map();let reloads=0;
 async function visit({missing=false, newer=false, offline=false}={}) {
  let ready;
  runInNewContext(script, {
   window:{},
   document:{addEventListener(event,fn){ready=fn;},getElementById:()=>missing?null:{},querySelector:()=>({})},
   sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
   location:{reload(){reloads++;}},
   fetch:async()=>{if(offline)throw Error('offline');return {ok:true,text:async()=>`window.__MOND_V = '${newer?'different-feature-version':currentStamp}';`};}
  });
  await ready();
 }
 await visit({offline:true});assert.equal(reloads,0);
 await visit();assert.equal(reloads,0);
 await visit({newer:true});assert.equal(reloads,1);
 await visit({newer:true});assert.equal(reloads,1);
 storage.clear();
 await visit({missing:true});assert.equal(reloads,2);
 await visit({missing:true});assert.equal(reloads,2);
});
