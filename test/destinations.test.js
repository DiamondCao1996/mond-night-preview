import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {viewForHash} from '../assets/engine/routes.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {moveControl} from '../assets/destinations.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
test('five destinations retain order with care integrated at home',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const nav=html.match(/<nav[\s\S]*?<\/nav>/)[0];
 assert.deepEqual([...nav.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]),['home','rhythm','tools','journal','settings']);
 assert.equal((html.match(/id="companion-view"/g)||[]).length,0);
 assert.match(html,/id="settings-view"[\s\S]*id="factors-view"/);
});
test('care, companion, settings, device and factors bookmarks work without storage or sensor',()=>{
 for(const route of ['care','care-view','companion','companion-view'])assert.equal(viewForHash('#'+route,null),'home');
 for(const route of ['settings','settings-view','device','devices','device-view','preferences','baseline','factors','factors-view','advanced'])assert.equal(viewForHash('#'+route,null),'settings');
});
test('relocation keeps node identity, current values and listeners through repeated moves',()=>{
 let calls=0;const node={value:'user preference',onclick:()=>calls++},first={append(n){n.parentNode=this;}},second={append(n){n.parentNode=this;}};
 for(let i=0;i<3;i++){moveControl(node,first);node.onclick();moveControl(node,second);node.onclick();}
 assert.equal(calls,6);assert.equal(node.value,'user preference');assert.equal(node.parentNode,second);
});
test('refinement provides keyboard entry, return links and no persistence writes or forced setup',async()=>{
 const source=await readFile(new URL('../assets/destinations.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c',import.meta.url),'utf8');
 assert.match(source,/focus\(\{preventScroll:true\}\)/);assert.match(source,/href='#settings'|href='#settings'/);assert.match(source,/href="#home"/);
 assert.doesNotMatch(source,/localStorage|setItem|removeItem|showModal/);
 for(const id of ['support-card','music-card','quiet-mobile','open-baseline'])assert.ok(source.includes(id));
});
