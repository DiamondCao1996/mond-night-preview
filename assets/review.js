import {revealView} from './engine/routes.js';
import {loadEmotions,loadFirstAid,loadPmr,loadLogs} from './engine/store.js';
import {COLUMN_IDS,isoWeekKey,weekMonday,classifyWeek,loadInnerReview,saveReviewLine,suggestedSteps} from './engine/innerReview.js';
const copy={
 zh:{entry:'内在盘点',title:'内在盘点 Inner Review',add:'+ 补一句',save:'保存',cancel:'取消',swap:'换一句',prev:'上一周',next:'下一周',empty:'给这一周留一点空间。',feel:'记录情绪',privacy:'这是对已记录内容的个人回顾，不是诊断或医疗建议。仅保存在此浏览器。',nourish:'滋养我的事',drain:'消耗我的事',error:'暂时无法保存，请重试。',headings:['情绪','行为','身体','信念转念','能量来源','微小的第一步'],prompts:[['本周最常出现的情绪','触发场景','情绪背后的隐藏需求'],['重复出现的行为或习惯','是什么推动我这样做','想继续或停止的行为'],['最常出现的身体感受','这些感受在什么情况下出现','身体想告诉我什么','我可以为身体做些什么'],['识别本周反复出现的限制性信念','哪些事实不支持这个信念','我更愿意相信的新信念'],['滋养我的事','消耗我的事'],['本周的第一步','或下周想尝试的一小步']]},
 en:{entry:'Inner review',title:'Inner Review',add:'+ Add a line',save:'Save',cancel:'Cancel',swap:'Another phrase',prev:'Previous week',next:'Next week',empty:'A little room to look back on your week.',feel:'Log a feeling',privacy:'A personal recap of what you already logged, not a diagnosis or medical advice. Saved only in this browser.',nourish:'What nourished me',drain:'What drained me',error:'Could not save. Please try again.',headings:['Emotions','Behavior','Body','Reframing beliefs','Energy sources','A tiny first step'],prompts:[['Most frequent emotions this week','Triggering situations','Hidden needs behind emotions'],['Recurring behaviors or habits','What drives me to do this','Behaviors to continue or stop'],['Most frequent body sensations','When these sensations appear','What my body wants to tell me','What I can do for my body'],['Recurring limiting beliefs this week','Facts that do not support this belief','A new belief I would rather hold'],['What nourished me','What drained me'],['This week’s first step','Or a small step to try next week']]},
 sv:{entry:'Inre reflektion',title:'Inre reflektion · Inner Review',add:'+ Lägg till en rad',save:'Spara',cancel:'Avbryt',swap:'En annan mening',prev:'Föregående vecka',next:'Nästa vecka',empty:'Lite utrymme att se tillbaka på din vecka.',feel:'Notera en känsla',privacy:'En personlig återblick på det du redan har noterat, ingen diagnos eller medicinsk rådgivning. Sparas bara i denna webbläsare.',nourish:'Det som gav mig energi',drain:'Det som tog min energi',error:'Kunde inte spara. Försök igen.',headings:['Känslor','Beteenden','Kroppen','Nya perspektiv','Energikällor','Ett litet första steg'],prompts:[['Veckans vanligaste känslor','Utlösande situationer','Behov bakom känslorna'],['Återkommande beteenden eller vanor','Vad som driver mig','Beteenden att fortsätta eller sluta med'],['Vanliga kroppsliga förnimmelser','När de uppstår','Vad kroppen vill berätta','Vad jag kan göra för kroppen'],['Återkommande begränsande övertygelser','Fakta som inte stöder övertygelsen','En ny övertygelse jag hellre vill ha'],['Det som gav mig energi','Det som tog min energi'],['Veckans första steg','Eller ett litet steg att prova nästa vecka']]}
};
const subtitles=['EMOTIONS','BEHAVIOR','BODY','REFRAMING BELIEFS','ENERGY SOURCES','TINY FIRST'];
const terms={
 'forest-leaves':['森林接纳所有的叶子','Forest leaves','Skogens löv'],'safe-space-within':['内在安全空间','Safe space within','En trygg plats inom dig'],'box-breathing':['盒式呼吸','Box breathing','Fyrkantsandning'],pmr:['渐进式肌肉放松','Progressive muscle relaxation','Progressiv muskelavslappning'],body:['身体','Body','Kropp'],connection:['连接','Connection','Kontakt'],care:['照顾','Care','Omsorg']
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
let monday=weekMonday(),phrase=0;
function render(){
 const raw=document.getElementById('language')?.value||document.documentElement.lang,lang=raw.startsWith('zh')?'zh':raw==='sv'?'sv':'en',t=copy[lang],n=lang==='zh'?0:lang==='sv'?2:1;
 for(const id of ['review-open-home','review-open-journal']){const a=document.getElementById(id);if(a)a.textContent=t.entry;}
 if(location.hash!=='#review')return;
 const host=document.getElementById('review-view');revealView(host);
 document.getElementById('section-kicker').textContent='INNER REVIEW';document.getElementById('page-title').textContent=t.title;
 const week=isoWeekKey(monday),end=new Date(monday);end.setDate(end.getDate()+6);
 const model=classifyWeek({week,emotions:loadEmotions(),firstAid:loadFirstAid(),pmr:loadPmr(),logs:loadLogs(),sessions:read('mond-sessions',[]),profile:read('mond-profile',{}),entries:loadInnerReview()});
 const label=node=>typeof node==='string'?node:node?.[lang]||node?.en||node?.zh||node?.label||node?.id||'';
 const item=x=>{
  if(typeof x==='string')return esc(x);
  if(x.type==='sensor'){
   const relation={zh:{lower:'略低于',near:'接近',higher:'略高于'},en:{lower:'a little lower than',near:'near',higher:'a little higher than'},sv:{lower:'lite lägre än',near:'nära',higher:'lite högre än'}}[lang][x.relation];
   return esc(lang==='zh'?`本周 ${x.metric==='hr'?'HR':'RMSSD'} ${relation}安静样本基线。`:lang==='sv'?`Veckans ${x.metric.toUpperCase()} var ${relation} din baslinje från lugna mätningar.`:`This week’s ${x.metric.toUpperCase()} was ${relation} your quiet-sample baseline.`);
  }
  const dot=/^#[0-9a-f]{3,8}$/i.test(x.color||'')?`<i class="review-dot" style="background:${x.color}" aria-hidden="true"></i>`:'';
  const prefix=x.kind==='trigger'?t.prompts[0][1]:x.kind==='need'?t.prompts[0][2]:'';
  return `${dot}${prefix?`<small>${esc(prefix)}</small>`:''}${esc(x.text|| (x.type==='emotion'?label(x.node):terms[x.id]?.[n]||x.id))}${x.count?` <span class="review-count">× ${x.count}</span>`:''}`;
 };
 const list=items=>`<ul>${items.map(x=>`<li>${item(x)}</li>`).join('')}</ul>`;
 const steps=suggestedSteps(model),suggestion=steps[phrase%steps.length][lang];
 host.innerHTML=`<div class="review-header"><div><span class="tiny-label">Week3 · INNER REVIEW</span><h2>${esc(t.title)}</h2></div><div class="review-weeks"><button data-prev aria-label="${t.prev}">←</button><div aria-live="polite"><strong>${week}</strong><br><span>${monday.getMonth()+1}/${monday.getDate()}–${end.getMonth()+1}/${end.getDate()}</span></div><button data-next aria-label="${t.next}">→</button></div></div>${model.empty?`<p class="review-empty">${t.empty} <a href="#feel">${t.feel} →</a></p>`:''}<div class="review-spread">${COLUMN_IDS.map((id,i)=>{
  const all=[...model.auto[id],...model.user[id]];
  return `<article class="review-band" data-column="${id}" aria-labelledby="review-${id}-title"><h3 id="review-${id}-title">${t.headings[i]}</h3><span class="review-subtitle">${subtitles[i]}</span><div class="review-prompts">${t.prompts[i].map(p=>`<p>${p}</p>`).join('')}</div><div class="review-lines">${id==='energy'?['nourish','drain'].map(kind=>`<section class="review-energy ${kind}"><h4>${t[kind]}</h4>${list(all.filter(x=>x.kind===kind))}</section>`).join(''):list(all)}</div>${id==='step'?`<button class="review-suggestion" data-accept>${esc(suggestion)}</button><button class="text-button" data-swap>${t.swap}</button>`:''}<button class="text-button review-add" data-add aria-expanded="false" aria-controls="review-form-${id}">${t.add}</button><form id="review-form-${id}" hidden><label>${t.add}<textarea maxlength="1000" rows="3" required></textarea></label>${id==='energy'?`<label><select aria-label="${t.headings[i]}"><option value="nourish">${t.nourish}</option><option value="drain">${t.drain}</option></select></label>`:''}<div><button class="primary" type="submit">${t.save}</button><button class="text-button" type="button" data-cancel>${t.cancel}</button></div><p role="alert"></p></form></article>`;
 }).join('')}</div><p class="review-privacy">${t.privacy}</p><p role="status" id="review-status"></p>`;
 host.querySelector('[data-prev]').onclick=()=>move(-7);host.querySelector('[data-next]').onclick=()=>move(7);
 function move(days){monday.setDate(monday.getDate()+days);phrase=0;render();}
 host.querySelector('[data-swap]').onclick=()=>{phrase++;render();host.querySelector('[data-swap]').focus();};
 host.querySelector('[data-accept]').onclick=()=>{try{saveReviewLine(week,'step',suggestion);render();host.querySelector('[data-accept]').focus();}catch{host.querySelector('#review-status').textContent=t.error;}};
 host.querySelectorAll('[data-column]').forEach(band=>{
  const form=band.querySelector('form'),add=band.querySelector('[data-add]');
  add.onclick=()=>{form.hidden=false;add.hidden=true;add.setAttribute('aria-expanded','true');form.querySelector('textarea').focus();};
  band.querySelector('[data-cancel]').onclick=()=>{form.hidden=true;add.hidden=false;add.setAttribute('aria-expanded','false');add.focus();};
  form.onsubmit=e=>{e.preventDefault();const value=form.querySelector('textarea').value.trim();if(!value)return;try{saveReviewLine(week,band.dataset.column,{text:value,kind:form.querySelector('select')?.value});render();host.querySelector(`[data-column="${band.dataset.column}"] [data-add]`).focus();}catch{form.querySelector('[role="alert"]').textContent=t.error;}};
 });
}
const refresh=()=>queueMicrotask(render);
for(const event of ['hashchange','mond-language-change','mond-data-change','storage'])window.addEventListener(event,refresh);
document.getElementById('language')?.addEventListener('change',refresh);
refresh();
