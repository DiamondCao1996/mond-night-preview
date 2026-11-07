import {WORKBOOK_TOOLS,loadPractices,savePractice} from './engine/workbook.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {TOOLS} from './engine/toolbox.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {recommend,latestEmotion} from './engine/recommendations.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {loadEmotions} from './engine/store.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {latestSavedMoment} from './engine/emotionLog.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {revealView} from './engine/routes.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const lang=()=>{const l=$('language')?.value||document.documentElement.lang;return l.startsWith('zh')?0:l==='sv'?2:1;};
const copy=[
 {title:'此刻，先走一小步',optional:'可选 · 换个更贴近的状态',states:['紧绷','低落','散乱','麻木','还好'],intro:'不需要传感器，也不必把感受说清楚。先试一条小路就好。',start:'轻轻开始',next:'继续',skip:'跳过这一步',back:'上一步',note:'可选 · 留一句给自己',save:'完成并保存',finish:'完成，不保存',exit:'先到这里 · 返回工具箱',saved:'这一小步，已保存在此浏览器。',done:'谢谢你，给自己留了这段时间。',again:'再来一次',history:'我留下的小笺',empty:'还没有保存的小笺。浏览不会生成记录。',del:'删除这条',error:'未能保存。原有记录未改动，请检查浏览器存储后重试。',alternatives:'也可以换一条小路',dismiss:'先不用',safety:'HRV 只是一个身体信号，不是诊断，也不能读懂心情。练习也许有帮助，身体练习完全可选；随时停止、跳过或自然呼吸。',progress:'步',support:'找一条此刻的小路 →'},
 {title:'One little step for now',optional:'Optional · Choose a closer state',states:['Tense','Low','Scattered','Numb','Okay'],intro:'No sensor needed, and no need to explain everything. Try just one path.',start:'Begin gently',next:'Continue',skip:'Skip this step',back:'Previous',note:'Optional · A note to yourself',save:'Finish & save',finish:'Finish without saving',exit:'Stop here · Back to Toolbox',saved:'This small step is saved in this browser.',done:'Thank you for making this time for yourself.',again:'Try again',history:'My little notes',empty:'No saved notes yet. Exploring creates no records.',del:'Delete this note',error:'Could not save. Existing records were kept. Check browser storage and try again.',alternatives:'Other quiet paths',dismiss:'Not now',safety:'HRV is one body signal, not a diagnosis or a reading of your mood. Exercises may help; body exercises are optional. Stop, skip, or breathe naturally anytime.',progress:'step',support:'Find a little path for now →'},
 {title:'Ett litet steg för stunden',optional:'Valfritt · Välj ett närmare tillstånd',states:['Spänd','Låg','Splittrad','Avtrubbad','Okej'],intro:'Ingen sensor behövs, och du behöver inte förklara allt. Prova bara en väg.',start:'Börja varsamt',next:'Fortsätt',skip:'Hoppa över steget',back:'Föregående',note:'Valfritt · En lapp till dig själv',save:'Avsluta och spara',finish:'Avsluta utan att spara',exit:'Stanna här · Till verktygslådan',saved:'Det lilla steget är sparat i den här webbläsaren.',done:'Tack för att du tog den här stunden för dig själv.',again:'Prova igen',history:'Mina små lappar',empty:'Inga sparade lappar än. Att utforska skapar inga poster.',del:'Ta bort lappen',error:'Kunde inte spara. Tidigare poster är kvar. Kontrollera webbläsarens lagring och försök igen.',alternatives:'Andra stilla vägar',dismiss:'Inte nu',safety:'HRV är en kroppssignal, ingen diagnos eller avläsning av humöret. Övningar kan hjälpa; kroppsövningar är valfria. Stanna, hoppa över eller andas naturligt när du vill.',progress:'steg',support:'Hitta en liten väg för stunden →'}
];
const reasons={
 unsafe:['如果此刻感到不安全，可以先给自己留一点支撑与空间。','If you feel unsafe right now, start with a little support and space.','Om du känner dig otrygg nu, börja med lite stöd och utrymme.'],
 default:['先感受身边的支撑，不用先完成问卷。','Start with support around you, without a questionnaire.','Börja med stödet omkring dig, utan frågeformulär.'],
 intense:['你记录的难受很强烈；先留一个安心的空间，比追着数字走更重要。','You logged an intense difficult feeling. A safe space comes before following a number.','Du noterade en stark svår känsla. Ett tryggt utrymme går före en siffra.'],
 emotion:['根据你记录的感受，森林也许是一个放下叶子的地方。','Based on your logged feeling, the forest may be a place to set a leaf down.','Utifrån din noterade känsla kan skogen vara en plats att lägga ner ett blad.'],
 tense:['你选择了紧绷，先试不需要屏息的舒适呼吸。','You chose tense. Try comfortable breathing without holds.','Du valde spänd. Prova behaglig andning utan andhållning.'],
 low:['低落的时候，可以先试一件很小的照顾，不必振作起来。','When feeling low, try a tiny act of care without needing to cheer up.','När du känner dig låg kan en liten omsorgshandling räcka utan krav på att bli glad.'],
 scattered:['你选择了散乱，先停一停，再决定下一步。','You chose scattered. Pause before choosing a next step.','Du valde splittrad. Pausa innan du väljer nästa steg.'],
 numb:['你选择了麻木，可以先轻轻留意周围，不必强迫自己有感觉。','You chose numb. Notice your surroundings gently, without forcing a feeling.','Du valde avtrubbad. Notera omgivningen varsamt utan att tvinga fram en känsla.'],
 okay:['留住一个微小的尝试，或按自己的节奏继续。','Keep one small effort, or continue at your own pace.','Spara en liten ansträngning eller fortsätt i din takt.'],
 'sensor-low':['最近180秒的合格 RMSSD 低于自己的兼容安静参照。可先试身体放松；这不能说明你的心理状态。','Qualified RMSSD over the latest 180 seconds is below your compatible quiet reference. You could try body relaxation; this does not establish your mental state.','Godkänd RMSSD under de senaste 180 sekunderna ligger under din jämförbara lugna referens. Du kan prova avslappning; det fastställer inte ditt psykiska tillstånd.'],
 'sensor-near':['最近180秒的合格 RMSSD 接近自己的安静参照。若有余力，可以留一点空间回望；这不代表心情正常。','Qualified RMSSD over the latest 180 seconds is near your quiet reference. If you have room, try reflecting; this does not mean your mood is normal.','Godkänd RMSSD under de senaste 180 sekunderna ligger nära din lugna referens. Om du har utrymme kan du reflektera; det betyder inte att humöret är normalt.'],
 'sensor-high':['最近180秒的合格 RMSSD 高于自己的安静参照。愿意的话，选一个温和的小行动；数值较高不证明心理状态改善。','Qualified RMSSD over the latest 180 seconds is above your quiet reference. Choose a gentle action if you wish; a higher value does not prove improved mental well-being.','Godkänd RMSSD under de senaste 180 sekunderna ligger över din lugna referens. Välj en varsam handling om du vill; ett högre värde bevisar inte bättre psykiskt mående.'],
 absent:['没有当前可用的传感器比较；先从你的体验出发。','No current sensor comparison is available. Start with your experience.','Ingen aktuell sensorjämförelse finns. Börja med din upplevelse.'],
 stale:['这份测量已经不是此刻的读数，先不据此判断高低。','This measurement is no longer current, so it is not classified as high or low.','Mätningen är inte längre aktuell och klassas därför inte som hög eller låg.'],
 poor:['这份测量的连续性或质量不足，暂不比较高低。你的感受仍然有位置。','Continuity or quality is insufficient for a comparison. Your experience still matters.','Kontinuitet eller kvalitet räcker inte för en jämförelse. Din upplevelse har ändå plats.'],
 'no-baseline':['还没有新鲜、同设备且质量合格的安静参照；不会把示例或旧版记录当作你的起点。','There is no fresh, qualified quiet reference from the same device. Sample or legacy records are not used as your starting point.','En aktuell godkänd lugn referens från samma enhet saknas. Exempel eller äldre poster används inte som din utgångspunkt.'],
 'trend-lower':['与近期实际保存的可比测量相比，这次较低。先试一条舒缓的小路也可以。','This is lower than recent actual saved comparable measurements. A gentle settling path is an option.','Detta är lägre än nyligen sparade jämförbara mätningar. En lugn väg är ett alternativ.'],
 'trend-lower-detail':['近期实际测量也呈较低方向；只是观测，不是原因解释。','Recent measured comparisons also point lower; an observation, not an explanation.','Nyligen uppmätta jämförelser pekar också nedåt; en observation, ingen förklaring.'],
 'trend-higher':['比近期至少两次可比的实际测量高；不代表心情更好。','Higher than at least two recent comparable measured sessions; not evidence of a better mood.','Högre än minst två nyligen uppmätta jämförbara sessioner; inget bevis på bättre humör.'],
 'trend-steady':['与近期至少两次可比的实际测量接近。','Close to at least two recent comparable measured sessions.','Nära minst två nyligen uppmätta jämförbara sessioner.']
};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
let runtimeContext={};
function context(moment,entry,extra={}){return {moment:moment||runtimeContext.moment||latestSavedMoment(),entry:entry||latestEmotion(loadEmotions()),profile:extra.profile||runtimeContext.profile||read('mond-profile',{}),history:extra.history||runtimeContext.history||read('mond-sessions',[])};}
window.addEventListener('mond-moment-saved',e=>{if(e.detail)runtimeContext=e.detail;});
window.addEventListener('mond-profile-change',e=>{if(e.detail?.profile)runtimeContext.profile=e.detail.profile;});
function title(route,n){return TOOLS.find(t=>t.route===route)?.titles[n]||route;}
export function recommendationMarkup(result,n=lang()){
 const c=copy[n],why=reasons[result.reason]||reasons.default;
 return `<div class="path-preview" aria-hidden="true"><span>☾</span><i></i><b>✧</b></div><p class="path-why">${esc(why[n])}</p>${result.evidence.trend?`<p class="small">${esc(reasons[result.evidence.trend==='lower'?'trend-lower-detail':`trend-${result.evidence.trend}`][n])}</p>`:''}<a class="primary path-primary" href="#${result.primary}">${esc(title(result.primary,n))} →</a><details class="path-alternatives"><summary>${c.alternatives}</summary>${result.alternatives.map(r=>`<a class="text-button" href="#${r}">${esc(title(r,n))}</a>`).join('')}</details>`;
}
let selectedState='',dialog=null;
export function mountRecommendation(host,{moment,entry,careContext}={}){
 const draw=()=>{const n=lang(),c=copy[n],result=recommend({...context(moment,entry,careContext),state:selectedState});host.innerHTML=`<h2>${c.title}</h2><p>${c.intro}</p>${recommendationMarkup(result,n)}<details class="path-states"><summary>${c.optional}</summary><div class="state-chips" role="group" aria-label="${c.optional}">${['tense','low','scattered','numb','okay'].map((s,i)=>`<button class="outline" data-state="${s}" aria-pressed="${selectedState===s}">${c.states[i]}</button>`).join('')}</div></details><p class="small path-safety">${c.safety}</p>`;host.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',event=>{const route=a.hash.slice(1),logged=entry||latestEmotion(loadEmotions());if(logged&&['forest','safe-space'].includes(route)){const open=new CustomEvent('mond-open-recommended-aid',{cancelable:true,detail:{entry:logged,strategyId:route==='forest'?'forest-leaves':'safe-space-within'}});if(!window.dispatchEvent(open))event.preventDefault();}}));host.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{selectedState=b.dataset.state;draw();host.querySelector(`[data-state="${selectedState}"]`)?.focus();});};draw();
}
export function offerRecommendation(moment,entry,careContext){
 if(dialog?.open)return;
 selectedState='';dialog=document.createElement('dialog');dialog.className='first-aid-dialog care-path-dialog';dialog.setAttribute('aria-label',copy[lang()].title);
 const content=document.createElement('div'),close=document.createElement('button');close.className='text-button';dialog.append(content,close);
 const draw=()=>{mountRecommendation(content,{moment,entry,careContext});close.textContent=copy[lang()].dismiss;dialog.setAttribute('aria-label',copy[lang()].title);};
 close.onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target.closest('a[href]'))dialog.close();});
 window.addEventListener('mond-language-change',draw);dialog.addEventListener('close',()=>{window.removeEventListener('mond-language-change',draw);dialog.remove();dialog=null;},{once:true});document.body.append(dialog);draw();dialog.showModal();
}
let activeRoute='',stage=-1,notes=[],skipped=[],saved=false;
function reset(){stage=-1;notes=[];skipped=[];saved=false;}
const ornament=()=>'<div class="practice-garden" aria-hidden="true"><span>◡</span><i>✿</i><b>✧</b></div>';
export function renderWorkbook(focus=false){
 const route=location.hash.slice(1),tool=WORKBOOK_TOOLS.find(t=>t.route===route),n=lang(),c=copy[n];
 if(!tool&&route!=='support-now'){if(activeRoute){activeRoute='';reset();}return;}
 if(activeRoute!==route){activeRoute=route;reset();}
 let host=$(`${route}-view`);if(!host){host=document.createElement('section');host.id=`${route}-view`;host.className='view';$('main').append(host);}
 revealView(host);$('page-title').textContent=tool?.titles[n]||c.title;$('section-kicker').textContent='MOND · '+(tool?.titles[n]||c.title);
 if(route==='support-now'){mountRecommendation(host);return;}
 const done=stage===tool.steps.length;
 host.innerHTML=`<article class="card workbook-panel" data-practice="${route}"><h2 tabindex="-1">${esc(tool.titles[n])}</h2>${ornament()}${stage<0?`<p>${esc(tool.descriptions[n])}</p>`:done?`<p role="status">${saved?c.saved:c.done}</p>`:`<p class="practice-count">${c.progress} ${stage+1} / ${tool.steps.length}</p><progress value="${stage+1}" max="${tool.steps.length}" aria-label="${c.progress}"></progress><p class="practice-prompt">${esc(tool.steps[stage][n])}</p><details ${notes[stage]?'open':''}><summary>${c.note}</summary><label><span class="sr-only">${c.note}</span><textarea maxlength="1500" rows="4">${esc(notes[stage]||'')}</textarea></label></details>`}<div class="aid-actions">${done?`<button class="outline" data-again>${c.again}</button>`:stage<0?`<button class="primary" data-next>${c.start}</button>`:`${stage>0?`<button class="text-button" data-back>${c.back}</button>`:''}${stage===tool.steps.length-1?`<button class="primary" data-save>${c.save}</button><button class="text-button" data-finish>${c.finish}</button>`:`<button class="primary" data-next>${c.next}</button>`}<button class="text-button" data-skip>${c.skip}</button>`}<a class="text-button" href="#tools">${c.exit}</a></div><p role="alert" data-error></p><p class="small">${c.safety}</p></article><details class="card workbook-history"><summary>${c.history}</summary><div data-history></div></details>`;
 host.querySelector('textarea')?.addEventListener('input',e=>{notes[stage]=e.target.value;});
 const advance=()=>{stage++;renderWorkbook(true);};
 host.querySelector('[data-next]')?.addEventListener('click',advance);
 host.querySelector('[data-back]')?.addEventListener('click',()=>{stage--;renderWorkbook(true);});
 host.querySelector('[data-skip]')?.addEventListener('click',()=>{skipped.push(stage);advance();});
 host.querySelector('[data-finish]')?.addEventListener('click',advance);
 host.querySelector('[data-save]')?.addEventListener('click',()=>{try{savePractice({route,notes:Array.from({length:tool.steps.length},(_,i)=>notes[i]||''),skipped});saved=true;advance();}catch{host.querySelector('[data-error]').textContent=c.error;}});
 host.querySelector('[data-again]')?.addEventListener('click',()=>{reset();renderWorkbook(true);});
 const history=loadPractices().filter(r=>r?.route===route&&Array.isArray(r.notes)).slice().reverse();const historyHost=host.querySelector('[data-history]');
 historyHost.innerHTML=history.length?history.map(r=>`<article class="practice-note"><time>${esc(new Date(r.utc).toLocaleDateString(['zh-CN','en','sv'][n]))}</time>${r.notes.map(note=>note?`<p>${esc(note)}</p>`:'').join('')}<button class="text-button" data-delete="${esc(r.id)}">${c.del}</button></article>`).join(''):`<p>${c.empty}</p>`;
 host.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{try{localStorage.setItem('mond-workbook-practices',JSON.stringify(loadPractices().filter(r=>r.id!==b.dataset.delete)));renderWorkbook();}catch{host.querySelector('[data-error]').textContent=c.error;}});
 if(focus)host.querySelector('h2').focus();
}
function refresh(){queueMicrotask(()=>{renderWorkbook();const host=$('tool-recommendation');if(host?.dataset?.workbookRecommendation)mountRecommendation(host);const link=$('home-path-link');if(link)link.textContent=copy[lang()].support;});}
document.addEventListener?.('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
for(const event of ['hashchange','mond-language-change','mond-tools-ready','mond-recommendation-ready'])window.addEventListener(event,refresh);
$('language')?.addEventListener('change',refresh);window.addEventListener('storage',event=>{if(!event.key||event.key==='mond-profile')delete runtimeContext.profile;if(!event.key||event.key==='mond-sessions'){delete runtimeContext.moment;delete runtimeContext.history;}refresh();});refresh();
