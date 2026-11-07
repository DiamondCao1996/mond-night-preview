import {suggestionsFor,suggestionPrimary} from './engine/suggestions.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
export function mountChips(input,{field,path=[],append=['note','sessionNote','occurrence'].includes(field)}={}) {
 if(!input||input.nextElementSibling?.classList.contains('suggest-chips'))return;
 const lang=document.getElementById('language')?.value||document.documentElement.lang,zh=lang==='zh-CN';
 const pool=suggestionsFor({field,path,lang});if(!pool.length)return;
 input.placeholder=suggestionPrimary({field,path,lang});
 const row=document.createElement('div');row.className='suggest-chips';row.setAttribute('role','group');row.setAttribute('aria-label',zh?'试试这些词':'Words to try');input.after(row);
 let expanded=false;
 const draw=()=>{row.replaceChildren();(expanded?pool:[suggestionPrimary({field,path,lang})]).forEach(value=>{const b=document.createElement('button');b.type='button';b.className=expanded?'suggest-chip':'suggest-ghost text-button';b.textContent=value;b.onclick=()=>{const old=input.value.trim();input.value=append&&old?(old.includes(value)?old:old+(zh?'，':' · ')+value):value;input.dispatchEvent(new Event('input',{bubbles:true}));};row.append(b);});const more=document.createElement('button');more.type='button';more.className='suggest-more text-button';more.textContent=expanded?(zh?'收起':'Less'):(zh?'换一句':'Another');more.onclick=()=>{expanded=!expanded;draw();};row.append(more);};draw();
}
// Keep writing optional while leaving the recommendation visible when collapsed.
export function collapseOptional(input){
 if(!input||input.closest('details'))return;
 const zh=(document.getElementById('language')?.value||document.documentElement.lang)==='zh-CN';
 const label=input.closest('label')||input,details=document.createElement('details'),summary=document.createElement('summary'),hint=document.createElement('p');
 summary.textContent=zh?'想写一点点吗？（可选）':'Want to write a little? (optional)';
 hint.textContent=zh?'如果愿意，可以写一点点。不写也很好。':'If you like, write a little. Leaving it blank is fine too.';
 label.before(details);details.append(summary,hint,label);
 const ghost=input.nextElementSibling;if(ghost?.classList.contains('suggest-chips'))details.before(ghost);
}
