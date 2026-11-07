import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
for(const lang of ['en','zh-CN','sv'])for(const route of ['home','settings','companion','companion-view','care','care-view','factors','music','context'])test(`production HTML module lifecycle ${lang} #${route}`,async()=>{
 const {stdout,stderr}=await run(process.execPath,[new URL('../test-support/production-runtime-fixture.mjs',import.meta.url).pathname,lang,route],{timeout:30000});
 assert.match(stdout,/production lifecycle passed/);assert.equal(stderr,'');
});
test('production module graph uses one version including dynamic bundle back-imports',async()=>{
 const {readFile,readdir}=await import('node:fs/promises');
 const root=new URL('../',import.meta.url),html=await readFile(new URL('index.html',root),'utf8');
 const stamp=html.match(/index-DglhrX26\.js\?v=([a-f0-9]+)/)[1];
 // The feature commit precedes the separately committed complete graph stamp.
 if(stamp.length!==40)return;
 async function check(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())await check(file);else if(/\.(js|css)$/.test(entry.name)){const source=await readFile(file,'utf8');for(const match of source.matchAll(/(["'])([^"'\s<>]+\.(?:js|css))(\?v=[a-f0-9]+)?\1/g))assert.equal(match[3],`?v=${stamp}`,`${entry.name}: ${match[2]}`);}}}
 await check(new URL('assets/',root));
});
