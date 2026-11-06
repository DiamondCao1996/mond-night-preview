import {suggestionsFor} from './engine/suggestions.js';
export function mountChips(input,{field,path=[],append=['note','sessionNote','occurrence'].includes(field)}={}) {
 if(!input||input.nextElementSibling?.classList.contains('suggest-chips'))return;
 const lang=document.getElementById('language')?.value||document.documentElement.lang,zh=lang==='zh-CN';
 const pool=suggestionsFor({field,path,lang});let offset=0;
 const row=document.createElement('div');row.className='suggest-chips';row.setAttribute('role','group');row.setAttribute('aria-label',zh?'试试这些词':'Words to try');input.after(row);
 const draw=()=>{row.replaceChildren();pool.slice(offset,offset+4).forEach(value=>{const b=document.createElement('button');b.type='button';b.className='suggest-chip';b.textContent=value;b.onclick=()=>{const old=input.value.trim();input.value=append&&old?(old.includes(value)?old:old+(zh?'，':' · ')+value):value;input.dispatchEvent(new Event('input',{bubbles:true}));b.setAttribute('aria-pressed','true');};row.append(b);});const more=document.createElement('button');more.type='button';more.className='suggest-more';more.textContent=zh?'换一批':'More';more.onclick=()=>{offset=(offset+2)%Math.max(1,pool.length-3);draw();};row.append(more);};draw();
}
