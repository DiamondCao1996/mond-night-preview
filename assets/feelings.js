import {revealView} from './engine/routes.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {FIRST_AID_DEFAULTS} from './engine/firstAid.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {mountChips,collapseOptional} from './suggestionChips.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {offerMomentCare} from './pmr.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {offerFirstAid} from './firstAid.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {EMOTION_WHEEL,findEmotion} from './engine/emotionWheel.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {addEmotion,deleteEmotion,emotionDistribution,exploreEmotionAssociations,localDate,buildSessionLink,latestSavedMoment} from './engine/emotionLog.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {loadEmotions,loadNights,loadLogs,mergeLogsIntoNights} from './engine/store.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {generateSampleNights} from './engine/sampleData.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
const copy={en:{entry:'Log a feeling',kicker:'A LITTLE ROOM FOR FEELING',pageTitle:'Log a feeling.',optional:'Your words are enough. Connecting MOND or importing nights can add body signals (HRV and sleep) alongside them, whenever you like. This is optional.',title:'A little room for your feelings.',intro:'Tap a color, then follow your words. You can stop and save at any level.',back:'← Back',save:'Keep this check-in',intensity:'Intensity (optional)',note:'A little note (optional)',skip:'Skip',history:'Your little check-ins',empty:'Your first little moment can start here.',del:'Delete',confirm:'Delete this emotion check-in from this browser?',distribution:'Your colors lately',days:'days',associations:'A curious look at nights',sample:'SAMPLE DATA',imported:'IMPORTED NIGHTS',small:'Not enough comparable data yet.',caption:'Same-date nights (starting on the check-in date), with this core vs other logged cores; at least 5 good-quality nights per group, from one device. Unadjusted exploratory look, not causal, not a diagnosis, and not a clinical mood or recovery score. No check-in is not evidence of an absent feeling.',privacy:'Your check-ins stay in this browser through local storage. No MOND cloud. Transcribed from a printed wheel; not a mood diagnosis or validated psychological instrument.',teaser:'How is your little world feeling?',cta:'Open the emotion compass →',selected:'Choose a color',saved:'A little moment, saved.',sleep:'Sleep (min)',with:'With / other'},'zh-CN':{entry:'记录情绪',kicker:'给心情一点空间',pageTitle:'记录情绪。',optional:'只写下感受就很好。你也可以连接 MOND 或导入夜晚，在文字旁添上身体信号（HRV 和睡眠）——完全可选，不影响保存心情。',title:'给心情留一点空间。',intro:'轻点颜色，慢慢寻找贴近你的词。任何一层都可以停下保存。',back:'← 返回',save:'保存这份心情',intensity:'强度（可选）',note:'写一点点（可选）',skip:'跳过',history:'你的心情小记',empty:'从此刻开始，留下一点感受。',del:'删除',confirm:'从此浏览器删除这条心情记录？',distribution:'最近的心情色彩',days:'天',associations:'好奇地看看夜晚',sample:'示例数据',imported:'已导入夜晚',small:'可比数据尚不足。',caption:'按同日期匹配（夜晚从记录当天开始），比较有此核心情绪与其他已记录核心情绪的夜晚；同一设备，两组各需至少5个质量良好的夜晚。未经调整的探索性观察，非因果、非诊断，也不是临床情绪或恢复评分。没有记录不代表没有感受。',privacy:'通过本地存储，仅保存在此浏览器，无 MOND 云端。词汇转录自印刷情绪轮；不是情绪诊断或经过验证的心理量表。',teaser:'你的小小世界，此刻感觉如何？',cta:'打开情绪罗盘 →',selected:'选一种颜色',saved:'小小心情，已保存。',sleep:'睡眠（分钟）',with:'此情绪 / 其他'}};
copy.sv={...copy.en,entry:'Notera en känsla',kicker:'LITE RUM FÖR KÄNSLOR',pageTitle:'Notera en känsla.',title:'Lite rum för dina känslor.',intro:'Tryck på en färg och följ dina ord. Du kan stanna och spara på varje nivå.',optional:'Dina ord räcker. Sensor och importerade nätter är helt valfria.',back:'← Tillbaka',save:'Spara känslan',intensity:'Intensitet (valfritt)',note:'En liten anteckning (valfritt)',skip:'Hoppa över',history:'Dina känslonoteringar',empty:'Din första lilla stund kan börja här.',del:'Ta bort',confirm:'Ta bort den här känslonoteringen från webbläsaren?',distribution:'Dina färger på sistone',days:'dagar',associations:'En nyfiken blick på nätterna',sample:'EXEMPELDATA',imported:'IMPORTERADE NÄTTER',small:'För få jämförbara data än.',selected:'Välj en färg',saved:'En liten stund, sparad.',sleep:'Sömn (min)',with:'Med / andra',teaser:'Hur känns din lilla värld just nu?',cta:'Öppna känslokompassen →',privacy:'Känslorna sparas i den här webbläsaren. Ingen MOND-molnlagring. Ingen diagnos eller validerat psykologiskt instrument.',caption:'En utforskande jämförelse av loggade känslor och nätter. Minst fem jämförbara nätter per grupp. Inte ett orsakssamband eller en diagnos.'};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let trail=[],note='',intensity=String(FIRST_AID_DEFAULTS.intensity),message='';
let analyticsKey='',analyticsNodes=[];
const point=(r,a)=>[180+r*Math.cos(a),180+r*Math.sin(a)];
function wheel(nodes,color,label){let angle=-Math.PI/2;const total=nodes.reduce((s,n)=>s+Math.max(1,n.children.length),0);return `<svg viewBox="0 0 360 360" class="emotion-wheel" aria-label="${esc(nodes.map(label).join(', '))}">${nodes.map(n=>{const span=Math.max(1,n.children.length)/total*Math.PI*2,end=angle+span,mid=angle+span/2,a=point(166,angle),b=point(166,end),c=point(58,end),d=point(58,angle),p=point(111,mid);const path=`M${a} A166 166 0 ${span>Math.PI?1:0} 1 ${b} L${c} A58 58 0 ${span>Math.PI?1:0} 0 ${d} Z`;angle=end;return `<g role="button" tabindex="0" data-emotion="${n.id}" aria-label="${esc(label(n))}"><path d="${path}" fill="${color||n.color}"/><text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="middle">${esc(label(n))}</text></g>`;}).join('')}<circle cx="180" cy="180" r="51" fill="var(--paper,#faf9f3)"/><text x="180" y="185" text-anchor="middle" aria-hidden="true">♡</text></svg>`;}
function render(){
 const lang=document.getElementById('language')?.value||document.documentElement.lang,t=copy[lang]||copy.en;
 const label=n=>n?.[lang==='zh-CN'?'zh':lang==='sv'?'sv':'en']||n?.en||'';
 for(const id of ['feel-open-home','feel-open-journal']){const link=document.getElementById(id);if(link)link.querySelector('span').textContent=t.entry;}
 if(!['#journal','#journal-view','#dashboard','#vision','#actions','#feel'].includes(location.hash))return;
 const host=document.getElementById(location.hash==='#feel'?'feel-view':'journal-timeline');if(!host)return;
 if(location.hash==='#feel'){revealView(host);document.getElementById('section-kicker').textContent=t.kicker;document.getElementById('page-title').textContent=t.pageTitle;}
 let root=document.getElementById('emotion-compass');if(!root){root=document.createElement('section');root.id='emotion-compass';}if(root.parentElement!==host)host.prepend(root);
 const entries=loadEmotions(),current=trail.at(-1),nodes=current?.children.length?current.children:trail.length?[]:EMOTION_WHEEL;
 const imported=loadNights(),hasConnection=document.getElementById('device-dot')?.classList.contains('on')||/sample session/i.test(document.getElementById('device-name')?.textContent||''),showAssociations=!!imported||hasConnection,end=new Date();end.setDate(end.getDate()-1);const nights=mergeLogsIntoNights(imported||(showAssociations?generateSampleNights({endDate:localDate(end)}):[]),loadLogs());
 const nextAnalyticsKey=JSON.stringify([lang,entries,nights,showAssociations,localDate(new Date())]);
 const reuseAnalytics=analyticsKey===nextAnalyticsKey&&analyticsNodes.length&&analyticsNodes.every(n=>n.parentElement===root);
 if(reuseAnalytics)analyticsNodes.forEach(n=>n.remove());
 root.innerHTML=`<article class="card emotion-panel"><h2>${t.title}</h2><p>${t.intro}</p>${!showAssociations?`<p class="emotion-optional">♡ ${t.optional}</p>`:''}<div class="emotion-trail" aria-live="polite">${esc(trail.length?trail.map(label).join(' › '):t.selected)}</div>${trail.length?`<button class="text-button" id="emotion-back">${t.back}</button>`:''}${nodes.length?wheel(nodes,trail[0]?.color,label):'<div class="emotion-heart" aria-hidden="true">♡</div>'}<div class="emotion-options">${nodes.map(n=>`<button class="outline" data-emotion="${n.id}">${esc(label(n))}</button>`).join('')}</div><form id="emotion-form"><label>${lang==='zh-CN'?'大概是这样的强度，可以改':'About this much — you can change it.'}<select id="emotion-intensity"><option value="">${t.skip}</option>${[1,2,3,4,5].map(i=>`<option ${String(i)===intensity?'selected':''}>${i}</option>`).join('')}</select></label><label>${t.note}<textarea id="emotion-note" maxlength="1000" rows="2">${esc(note)}</textarea></label><button class="primary" ${trail.length?'':'disabled'}>${t.save}</button></form><p role="status">${message?esc(t.saved):''}</p><p class="small">${t.privacy}</p></article>${reuseAnalytics?'':`<article class="card emotion-panel"><h2>${t.distribution}</h2>${[7,30].map(days=>{const counts=emotionDistribution(entries,{days}),total=Object.values(counts).reduce((a,b)=>a+b,0);return `<h3>${days} ${t.days} · ${total}</h3><div class="emotion-bar" aria-hidden="true">${EMOTION_WHEEL.map(c=>`<span style="background:${c.color};flex:${counts[c.id]}"></span>`).join('')}</div><div class="emotion-legend">${EMOTION_WHEEL.map(c=>`<span><i style="background:${c.color}"></i>${esc(label(c))} ${counts[c.id]}</span>`).join('')}</div>`;}).join('')}</article>${showAssociations?`<article class="card emotion-panel"><h2>${t.associations}</h2><span class="pill">${imported?t.imported:t.sample}</span><p>${t.caption}</p>${['hrvRmssdMs','sleepMinutes'].map(metric=>{const result=exploreEmotionAssociations(nights,entries,{metric});return `<h3>${metric==='hrvRmssdMs'?'HRV · RMSSD (ms)':t.sleep}</h3>${result.status==='not-enough-data'?`<p>${t.small}</p>`:''}${EMOTION_WHEEL.map(c=>{const g=result.groups[c.id];return `<p class="emotion-comparison"><strong>${esc(label(c))}</strong> ${g.status==='ok'?`${t.with}: ${g.meanWith.toFixed(1)} / ${g.meanWithout.toFixed(1)}`:t.small} <small>n=${g.nWith}/${g.nWithout}</small></p>`;}).join('')}`;}).join('')}</article>`:''}`}${location.hash!=='#feel'?`<article class="card emotion-panel"><h2>${t.history}</h2>${entries.length?[...entries].sort((a,b)=>b.utc.localeCompare(a.utc)).map(e=>`<div class="emotion-entry"><p><time>${esc(e.date)}</time> · ${esc(e.path.map(p=>label(findEmotion(p.id)||p)).join(' › '))}${e.intensity?` · ${e.intensity}/5`:''}</p>${e.session?`<p class="emotion-context">${esc(sessionSummary(e.session,lang))}</p>`:''}${e.note?`<p class="emotion-note">${esc(e.note)}</p>`:''}<button class="text-button" data-delete-emotion="${esc(e.id)}">${t.del}</button></div>`).join(''):`<p>${t.empty}</p>`}</article>`:''}`;
 if(reuseAnalytics){const history=location.hash!=='#feel'?root.lastElementChild:null;analyticsNodes.forEach(n=>root.insertBefore(n,history));}else{analyticsNodes=[...root.children].slice(1,location.hash!=='#feel'?-1:undefined);analyticsKey=nextAnalyticsKey;}
 root.querySelector('.emotion-wheel')?.classList.add('compass-enter');
 root.querySelectorAll('[data-emotion]').forEach(el=>{const choose=()=>{trail.push(findEmotion(el.dataset.emotion));message='';render();root.querySelector('#emotion-back')?.focus();};el.onclick=choose;if(el.tagName.toLowerCase()==='g')el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};});
 root.querySelector('#emotion-back')?.addEventListener('click',()=>{trail.pop();render();});
 root.querySelector('#emotion-note').oninput=e=>note=e.target.value;root.querySelector('#emotion-intensity').onchange=e=>intensity=e.target.value;
 mountChips(root.querySelector('#emotion-note'),{field:'note',path:trail});collapseOptional(root.querySelector('#emotion-note'));
 root.querySelector('form').onsubmit=e=>{e.preventDefault();if(!trail.length)return;try{const saved=addEmotion({path:trail,intensity:intensity?Number(intensity):undefined,note});trail=[];note='';intensity=String(FIRST_AID_DEFAULTS.intensity);message='saved';render();offerFirstAid(saved.at(-1));}catch(error){root.querySelector('[role="status"]').textContent=error.message;}};
 root.querySelectorAll('[data-delete-emotion]').forEach(btn=>btn.onclick=()=>{if(confirm(t.confirm)){deleteEmotion(btn.dataset.deleteEmotion);render();}});
}
const refresh=()=>queueMicrotask(render);
for(const event of ['hashchange','mond-language-change','mond-data-change','storage'])window.addEventListener(event,refresh);
document.getElementById('language')?.addEventListener('change',refresh);
refresh();

function sessionSummary(session,lang,details=false) {
 const zh=lang==='zh-CN',parts=[session.mode==='demo'?(zh?'示例记录':'Sample session'):(zh?'传感器记录':'Sensor session')];
 if(Number.isFinite(session.metrics?.hr))parts.push(`HR ${Math.round(session.metrics.hr)} bpm`);
 if(Number.isFinite(session.metrics?.rmssd))parts.push(`RMSSD ${Number(session.metrics.rmssd).toFixed(1)} ms`);
 if(details&&Number.isFinite(session.events))parts.push(`${session.events} ${zh?'个事件':'events'}`);
 if(details&&Number.isFinite(session.elapsed))parts.push(`${Math.floor(session.elapsed)} ${zh?'秒':'seconds'}`);
 return parts.join(' · ');
}
function openMomentCompass(moment) {
 const dialog=document.createElement('dialog');dialog.className='moment-compass emotion-panel';
 dialog.setAttribute('aria-labelledby','moment-compass-title');
 // This trail and form state belong only to this saved moment.
 let path=[],momentNote='',momentIntensity=String(FIRST_AID_DEFAULTS.intensity),savedEntry;
 const draw=()=>{
  const lang=document.getElementById('language')?.value||document.documentElement.lang,t=copy[lang]||copy.en,zh=lang==='zh-CN';
  const label=n=>n?.[zh?'zh':lang==='sv'?'sv':'en']||n?.en||'';
  const current=path.at(-1),nodes=current?.children.length?current.children:path.length?[]:EMOTION_WHEEL;
  dialog.innerHTML=`<h2 id="moment-compass-title">${zh?'给这一刻选个心情':'Attach a feeling to this saved moment'}</h2><p class="emotion-context">${esc(sessionSummary(buildSessionLink(moment),lang,true))}</p><p>${t.intro}</p><div class="emotion-trail" aria-live="polite">${esc(path.length?path.map(label).join(' › '):t.selected)}</div>${path.length?`<button type="button" class="text-button" data-back>${t.back}</button>`:''}${nodes.length?wheel(nodes,path[0]?.color,label):'<div class="emotion-heart" aria-hidden="true">♡</div>'}<div class="emotion-options">${nodes.map(n=>`<button type="button" class="outline" data-emotion="${n.id}">${esc(label(n))}</button>`).join('')}</div><form><label>${lang==='zh-CN'?'大概是这样的强度，可以改':'About this much — you can change it.'}<select><option value="">${t.skip}</option>${[1,2,3,4,5].map(i=>`<option ${String(i)===momentIntensity?'selected':''}>${i}</option>`).join('')}</select></label><label>${t.note}<textarea maxlength="1000" rows="2">${esc(momentNote)}</textarea></label><button class="primary" ${path.length?'':'disabled'}>${zh?'保存心情':'Save feeling'}</button><button type="button" class="text-button" data-skip>${zh?'跳过，只保存这一刻':'Skip, just keep this moment'}</button><p role="alert"></p></form>`;
  dialog.querySelector('.emotion-wheel')?.classList.add('compass-enter');
  dialog.querySelectorAll('[data-emotion]').forEach(el=>{
   const choose=()=>{path.push(findEmotion(el.dataset.emotion));draw();dialog.querySelector('[data-back]')?.focus();};
   el.onclick=choose;if(el.tagName.toLowerCase()==='g')el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};
  });
  dialog.querySelector('[data-back]')?.addEventListener('click',()=>{path.pop();draw();dialog.querySelector('[data-back], [data-emotion]')?.focus();});
  dialog.querySelector('textarea').oninput=e=>momentNote=e.target.value;
  mountChips(dialog.querySelector('textarea'),{field:'sessionNote',path});collapseOptional(dialog.querySelector('textarea'));
  dialog.querySelector('select').onchange=e=>momentIntensity=e.target.value;
  // Skip (including Escape/close) never writes an emotion; the moment is already saved.
  dialog.querySelector('[data-skip]').onclick=()=>dialog.close();
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();if(!path.length)return;try{
   const saved=addEmotion({path,intensity:momentIntensity?Number(momentIntensity):undefined,note:momentNote,session:buildSessionLink(moment)});
   savedEntry=saved.at(-1);
   dialog.close();
  }catch(error){dialog.querySelector('[role="alert"]').textContent=error.message;}};
 };
 dialog.addEventListener('close',()=>{dialog.remove();offerMomentCare(moment,savedEntry);},{once:true});
 const languageChange=()=>draw();window.addEventListener('mond-language-change',languageChange);
 dialog.addEventListener('close',()=>window.removeEventListener('mond-language-change',languageChange),{once:true});
 document.body.append(dialog);draw();dialog.showModal();
}
function wrapMomentSave() {
 const button=document.getElementById('save-note'),noteDialog=document.getElementById('note-dialog');
 if(noteDialog)mountChips(noteDialog.querySelector('#note'),{field:'sessionNote'});
 if(!button?.onclick||!noteDialog)return;
 const original=button.onclick;let saving=false;
 button.onclick=async function(event){
  if(saving||button.disabled||!noteDialog.open)return;
  saving=true;const previous=latestSavedMoment();
  try {
   await original.call(this,event);
   const moment=latestSavedMoment();
   if(!noteDialog.open&&!document.getElementById('note-error')?.textContent.trim()&&moment?.id!==previous?.id&&moment?.session?.events)openMomentCompass(moment);
  }finally{saving=false;}
 };
}
// Module scripts run after parsing; defer until the bundle has installed its handlers.
if(document.readyState==='complete')wrapMomentSave();else window.addEventListener('load',wrapMomentSave,{once:true});
