import {FIRST_AID_STRATEGIES,FIRST_AID_COPY,shouldOfferFirstAid,strategyForEntry,saveFirstAidExercise,loadFirstAid} from './engine/firstAid.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const language=()=>document.getElementById('language')?.value||document.documentElement.lang;
const text=()=>FIRST_AID_COPY[language()]||FIRST_AID_COPY.en;
const label=x=>x?.[language()==='zh-CN'?'zh':'en']||'';
let strategy=FIRST_AID_STRATEGIES[0],step=0,draft={},linkedEmotionId;
const svg=(body,cls='')=>`<svg class="${cls}" viewBox="0 0 120 90" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const icons={
 whale:svg('<path d="M15 46C15 17 77 18 87 47Q102 48 106 32Q118 51 99 62C78 85 17 79 15 46Z" fill="#c4d8de"/><path d="M46 24Q39 12 46 8M47 15Q57 8 61 14M39 59Q53 66 66 59"/><circle cx="29" cy="44" r="2" fill="currentColor"/><circle cx="92" cy="18" r="5"/><circle cx="106" cy="8" r="3"/>'),
 lamb:svg('<path d="M35 60v13m20-10v12m21-15v13"/><path d="M26 48Q16 33 31 29Q30 16 44 23Q53 10 64 23Q82 15 84 33Q99 40 84 53Q75 68 62 61Q44 72 35 59Q20 60 26 48Z" fill="#f5eddc"/><ellipse cx="80" cy="46" rx="13" ry="16" fill="#d9d4c4"/><path d="M69 36l-9-7m29 7 9-8"/><circle cx="83" cy="44" r="1.5" fill="currentColor"/>'),
 starfish:svg('<path d="M60 23 68 40 88 40 73 54 78 75 60 64 42 75 47 54 32 40 52 40Z" fill="#e8c1ac"/><circle cx="55" cy="49" r="1"/><circle cx="65" cy="49" r="1"/><path d="M56 56q4 4 8 0"/>'),
 bubbles:svg('<circle cx="53" cy="57" r="12" fill="#d6e7e4"/><circle cx="75" cy="35" r="7"/><circle cx="53" cy="21" r="4"/>')
};
const drop=n=>`<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 3C17 13 4 27 4 34a16 16 0 0 0 32 0C36 27 23 13 20 3Z"/></svg><span>${n}</span>`;
function reset(){step=0;draft={};linkedEmotionId=undefined;}
export function offerFirstAid(entry){
 if(!shouldOfferFirstAid(entry))return;
 const selected=strategyForEntry(entry);if(!selected)return;
 document.getElementById('first-aid-invitation')?.close();
 const dialog=document.createElement('dialog');dialog.id='first-aid-invitation';dialog.className='first-aid-dialog';dialog.setAttribute('aria-labelledby','first-aid-invite-title');
 const draw=()=>{const t=text();dialog.innerHTML=`<h2 id="first-aid-invite-title">${esc(t.invite)}</h2><div class="aid-actions"><button class="primary" data-yes>${esc(t.yes)}</button><button class="outline" data-no>${esc(t.no)}</button></div>`;
 dialog.querySelector('[data-no]').onclick=()=>dialog.close();dialog.querySelector('[data-yes]').onclick=()=>{reset();strategy=selected;linkedEmotionId=entry.id;dialog.close();location.hash='safe-space';render();};};
 const update=()=>draw();window.addEventListener('mond-language-change',update);
 dialog.addEventListener('close',()=>{window.removeEventListener('mond-language-change',update);dialog.remove();},{once:true});document.body.append(dialog);draw();dialog.showModal();
}
function valid(){return step===0?!!draft.before:step===1?!!draft.color:step===2?!!draft.size:step===3?!!draft.texture&&(draft.texture!=='custom'||!!draft.textureCustom?.trim()):!!draft.after;}
function render(focus=false){
 const t=text();document.querySelectorAll('[data-safe-space-entry]').forEach(el=>el.textContent=t.entry);
 if(location.hash!=='#safe-space')return;
 const host=document.getElementById('safe-space-view');if(!host)return;
 host.hidden=false;document.getElementById('section-kicker').textContent=label(strategy.title);document.getElementById('page-title').textContent=t.intro;
 const heading=step===0?t.before:step===4?t.after:step===5?t.done:label(strategy.questions[step-1]);
 let content='';
 if(step===0||step===4){const key=step===0?'before':'after';content=`<p>${esc(label(strategy.steps[step]))}</p><div class="aid-drops" role="group" aria-label="${esc(heading)}">${[1,2,3,4,5].map(n=>`<button class="aid-drop ${draft[key]>=n?'filled':''}" data-drop="${n}" aria-label="${esc(heading)} ${n}/5" aria-pressed="${draft[key]===n}">${drop(n)}</button>`).join('')}</div>`;}
 if(step===1)content=`${svg(`<path d="M22 69C2 68 5 42 24 42C21 18 53 10 63 32C81 13 106 33 99 47C124 53 110 76 93 71Z" fill="${draft.color||'transparent'}"/><path d="M13 25C0 25 2 9 13 10C18-2 34 0 37 11C53 10 49 27 38 25Z" fill="${draft.color||'transparent'}"/>`,'aid-cloud')}<div class="aid-swatches" role="group" aria-label="${esc(heading)}">${strategy.colors.map(color=>`<button style="--swatch:${color}" data-color="${color}" aria-label="${color}" aria-pressed="${draft.color===color}"></button>`).join('')}</div>`;
 if(step===2)content=`<div class="aid-sizes" role="group" aria-label="${esc(heading)}">${strategy.sizes.map(s=>`<button class="outline aid-size ${s.id}" data-size="${s.id}" aria-pressed="${draft.size===s.id}">${icons[s.id]}<span>${esc(label(s))}</span></button>`).join('')}</div>`;
 if(step===3)content=`<div class="aid-textures" role="group" aria-label="${esc(heading)}">${strategy.textures.map(x=>`<button class="outline" data-texture="${x.id}" aria-pressed="${draft.texture===x.id}"><span aria-hidden="true">${x.icon}</span><span>${esc(label(x))}<small>${language()==='zh-CN'?esc(x.en):esc(x.zh)}</small></span></button>`).join('')}</div><label class="aid-custom">${esc(t.custom)}<input maxlength="120" value="${esc(draft.textureCustom)}" aria-label="${esc(t.custom)}" /></label>`;
 if(step===5)content=`<p class="aid-comparison">${language()==='zh-CN'?`从 ${draft.before} 到 ${draft.after}`:`${t.before} ${draft.before} → ${t.after} ${draft.after}`}</p><div class="aid-actions"><a class="feel-open" href="#journal">${esc(t.journal)}</a><button class="outline" data-again>${esc(t.again)}</button></div>`;
 host.innerHTML=`<article class="card aid-panel"><p class="aid-progress">${step<5?`${step+1} / 5`:'♡'}</p><h2 tabindex="-1">${esc(heading)}</h2>${content}${step<5?`<div class="aid-actions">${step?`<button class="outline" data-back>${esc(t.back)}</button>`:''}<button class="primary" data-next ${valid()?'':'disabled'}>${esc(step===4?t.finish:t.next)}</button></div>`:''}<p role="status" class="aid-error"></p><p class="aid-safety">${esc(t.safety)}</p></article><article class="card aid-panel"><h2>${esc(t.history)}</h2>${loadFirstAid().length?[...loadFirstAid()].reverse().map(e=>`<div class="aid-history"><time>${esc(e.date)}</time> · ${e.before} → ${e.after}<p><i style="background:${strategy.colors.includes(e.color)?e.color:'transparent'}"></i>${esc(e.color)} · ${esc(label(strategy.sizes.find(x=>x.id===e.size)))} · ${esc(e.texture==='custom'?e.textureCustom:label(strategy.textures.find(x=>x.id===e.texture)))}</p></div>`).join(''):`<p>${esc(t.empty)}</p>`}</article>`;
 const bind=(selector,fn)=>host.querySelectorAll(selector).forEach(el=>el.onclick=()=>fn(el));
 bind('[data-drop]',el=>{draft[step===0?'before':'after']=Number(el.dataset.drop);render();host.querySelector(`[data-drop="${el.dataset.drop}"]`).focus();});
 for(const key of ['color','size','texture'])bind(`[data-${key}]`,el=>{draft[key]=el.dataset[key];render();host.querySelector(`[data-${key}="${el.dataset[key]}"]`).focus();});
 const input=host.querySelector('input');if(input)input.oninput=()=>{draft.texture='custom';draft.textureCustom=input.value;host.querySelectorAll('[data-texture]').forEach(el=>el.setAttribute('aria-pressed','false'));host.querySelector('[data-next]').disabled=!valid();};
 bind('[data-back]',()=>{step--;render(true);});bind('[data-again]',()=>{reset();render(true);});
 bind('[data-next]',()=>{if(!valid())return;if(step===4){try{saveFirstAidExercise({...draft,strategyId:strategy.id,emotionId:linkedEmotionId});linkedEmotionId=undefined;}catch{host.querySelector('.aid-error').textContent=t.error;return;}}step++;render(true);});
 if(focus)host.querySelector('h2').focus();
}
const refresh=()=>queueMicrotask(()=>render());
for(const event of ['hashchange','mond-language-change','storage'])window.addEventListener(event,refresh);
window.addEventListener('mond-data-change',()=>{if(!loadFirstAid().length&&step===5)reset();refresh();});
document.getElementById('language')?.addEventListener('change',refresh);
refresh();
