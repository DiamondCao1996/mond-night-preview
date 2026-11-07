import test from 'node:test';
import assert from 'node:assert/strict';
import {SUGGESTIONS,suggestionsFor} from '../assets/engine/suggestions.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
const fields=['note','sessionNote','occurrence','requirement','ethos','source','tend','butterfly','texture'];
test('all reflection fields have bilingual, varied generic phrases',()=>{for(const field of fields)for(const lang of ['zh','en'])assert.ok(new Set(SUGGESTIONS[field].generic[lang]).size>=4,`${field} ${lang}`);});
test('anger occurrence and its descendants inherit the right words',()=>{for(const path of [[{id:'anger'}],[{id:'anger'},{id:'hostile'}]]){const words=suggestionsFor({field:'occurrence',path,lang:'zh-CN'});assert.ok(words.includes('被人打断或忽视'));assert.ok(words.includes('事情没按计划进行'));assert.equal(words[0],'被人打断或忽视');}});
test('unknown paths fall back to generic in the requested language',()=>{for(const lang of ['zh-CN','en','sv'])assert.deepEqual(suggestionsFor({field:'note',path:[{id:'unknown'}],lang}),SUGGESTIONS.note.generic[lang==='zh-CN'?'zh':'en']);});
test('lookup fills short buckets from static generic data',()=>{SUGGESTIONS.note.test={zh:['一片小叶子'],en:['A little leaf']};try{assert.ok(suggestionsFor({field:'note',path:[{id:'test'}],lang:'en'}).length>=4);}finally{delete SUGGESTIONS.note.test;}});
test('suggestion data excludes harmful phrases',()=>{for(const buckets of Object.values(SUGGESTIONS))for(const pair of Object.values(buckets))for(const words of Object.values(pair))for(const word of words)assert.doesNotMatch(word,/自杀|自残|kill myself|suicide|self-harm/i);});

test('one primary suggestion is the best-fit first phrase',async()=>{
 const {suggestionPrimary}=await import('../assets/engine/suggestions.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5');
 for(const field of fields)for(const lang of ['en','zh-CN']){
 const options={field,path:[{id:'anger'}],lang};assert.equal(suggestionPrimary(options),suggestionsFor(options)[0]);
 }
 assert.equal(suggestionPrimary({field:'unknown'}),'');
});
