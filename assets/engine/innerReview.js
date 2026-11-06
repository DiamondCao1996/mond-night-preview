import {findEmotion} from './emotionWheel.js';
export const COLUMN_IDS=['emotion','behavior','body','belief','energy','step'];
const day=86400000;
// Calendar components preserve the runtime's local date, including across DST.
export function isoWeekKey(value=new Date()) {
 const d=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(`${value}T12:00:00`):new Date(value);
 if(!Number.isFinite(d.getTime()))return null;
 const u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
 u.setUTCDate(u.getUTCDate()+4-(u.getUTCDay()||7));
 const year=u.getUTCFullYear(),week=Math.ceil(((u-Date.UTC(year,0,1))/day+1)/7);
 return `${year}-W${String(week).padStart(2,'0')}`;
}
export function weekMonday(value=new Date()) {const d=new Date(value);d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
function recordWeek(r){if(r.date)return isoWeekKey(r.date);const t=r.utc??r.saved_at;return t==null?null:isoWeekKey(typeof t==='number'?t*1000:t);}
const text=v=>typeof v==='string'?v.trim():'';
export function classifyWeek({week,emotions=[],firstAid=[],pmr=[],logs=[],sessions=[],profile={},entries={}}={}) {
 const auto=Object.fromEntries(COLUMN_IDS.map(id=>[id,[]])),cores={},counts=new Map(),practices=new Map();
 const inside=items=>(Array.isArray(items)?items:[]).filter(r=>r&&recordWeek(r)===week);
 const add=(id,value,extra={})=>{if(text(value))auto[id].push({text:text(value),...extra});};
 const practice=id=>practices.set(id,(practices.get(id)||0)+1);
 for(const e of inside(emotions)){
  const path=Array.isArray(e.path)?e.path:[],leaf=path.at(-1),core=path[0],node=findEmotion(leaf?.id||leaf),root=findEmotion(core?.id||core),id=leaf?.id||leaf?.label||leaf?.en||leaf?.zh||(typeof leaf==='string'?leaf:null);
  if(id){const key=String(id),old=counts.get(key);counts.set(key,{type:'emotion',id:key,node:node||leaf,color:root?.color||core?.color,count:(old?.count||0)+1});}
  const cid=root?.id||core?.id||core;if(cid)cores[cid]=(cores[cid]||0)+1;
  add('emotion',e.note,{kind:'trigger'});
  if(['joy','surprise','fear','anger','disgust','sadness','low'].includes(cid))auto.energy.push({type:'emotion',node:node||leaf,color:root?.color||core?.color,kind:['joy','surprise'].includes(cid)?'nourish':'drain'});
 }
 auto.emotion.unshift(...[...counts.values()].sort((a,b)=>b.count-a.count));
 for(const f of inside(firstAid)){
  if(['forest-leaves','safe-space-within','box-breathing'].includes(f.strategyId))practice(f.strategyId);
  if(f.strategyId==='forest-leaves'){
   add('emotion',f.occurrence,{kind:'trigger'});add('emotion',f.requirement,{kind:'need'});
   for(const field of ['weight','shape','name'])add('body',f.leaf?.[field]);
   for(const field of ['ethos','source'])add('belief',f[field]);
  }
  if(f.strategyId==='safe-space-within')add('body',f.textureCustom||f.texture);
 }
 for(const p of inside(pmr)){
  if(p.completedZoneIds?.length)practice('pmr');
  for(const tag of p.tags||[])if(['body','connection','care'].includes(tag))auto.body.push({type:'tag',id:tag});
  add('body',p.note);
 }
 for(const l of inside(logs))for(const type of l.types||[])if(text(type))practice(type);
 auto.behavior=[...practices].map(([id,count])=>({type:'practice',id,count}));
 const samples=profile?.baselines?.sensor,baselines=(Array.isArray(samples)?samples:samples?[samples]:[]).filter(s=>s.mode==='sensor'&&s.version==='mond-causal-1.1'&&s.window===180);
 const sensor=inside(sessions).map(r=>r.session).filter(s=>s?.mode==='sensor');
 for(const [metric,stat] of [['rmssd','rmssd_ms'],['hr','mean_hr_bpm']]){
  const values=sensor.map(s=>s.metrics?.[metric]).filter(Number.isFinite),base=baselines.map(s=>s.stats?.[stat]).filter(Number.isFinite);
  if(values.length&&base.length){const mean=a=>a.reduce((s,v)=>s+v,0)/a.length,a=mean(values),b=mean(base),delta=a-b;auto.body.push({type:'sensor',metric,relation:Math.abs(delta)<=Math.abs(b)*.1?'near':delta<0?'lower':'higher'});break;}
 }
 const user=Object.fromEntries(COLUMN_IDS.map(id=>[id,Array.isArray(entries?.[week]?.[id])?entries[week][id]:[]]));
 return {auto,user,cores,practices:Object.fromEntries(practices),empty:COLUMN_IDS.every(id=>!auto[id].length&&!user[id].length)};
}
export const STEP_SUGGESTIONS={
 pause:{zh:'给自己一点停顿，再走进森林。',en:'A gentle pause can come before a visit to the forest.',sv:'En varsam paus kan få komma före en stund i skogen.'},
 safe:{zh:'给自己留一个安心的小角落。',en:'There is room for a small safe corner today.',sv:'Det finns plats för en liten trygg vrå idag.'},
 rest:{zh:'给自己留一点休息的空间。',en:'A little room for rest is enough for now.',sv:'Lite utrymme för vila räcker just nu.'},
 continue:{zh:'再给身体一次温柔的放松。',en:'Another gentle release can be a kind continuation.',sv:'En varsam avslappning till kan vara en vänlig fortsättning.'}
};
export function suggestedSteps({cores={},practices={}}={}){
 const draining=['fear','anger','disgust','sadness','low'].reduce((s,k)=>s+(cores[k]||0),0);
 const first=practices.pmr?'continue':cores.anger?'pause':cores.sadness||cores.low?'safe':draining?'rest':'safe';
 return [first,...Object.keys(STEP_SUGGESTIONS).filter(k=>k!==first)].map(k=>STEP_SUGGESTIONS[k]);
}
let memory={};
export function clearInnerReview(){memory={};if(typeof localStorage!=='undefined')localStorage.removeItem('mond-inner-review');}
export function loadInnerReview(){try{const v=typeof localStorage==='undefined'?memory:JSON.parse(localStorage.getItem('mond-inner-review')||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
export function saveReviewLine(week,column,value){
 if(!/^\d{4}-W\d{2}$/.test(week)||!COLUMN_IDS.includes(column))throw new TypeError('Invalid review destination');
 const line=text(typeof value==='string'?value:value?.text).slice(0,1000);if(!line)return;
 const data=loadInnerReview(),bucket=data[week]||{},items=Array.isArray(bucket[column])?bucket[column]:[];
 data[week]={...bucket,[column]:[...items,column==='energy'?{text:line,kind:value?.kind==='drain'?'drain':'nourish'}:{text:line}]};
 if(typeof localStorage==='undefined')memory=data;else localStorage.setItem('mond-inner-review',JSON.stringify(data));
 if(typeof window!=='undefined')window.dispatchEvent(new Event('mond-data-change'));
}

// Only explicit, valid choices override the current week's data.
export function journalPane({stored,weekHasData}={}) {
 return stored==='timeline'||stored==='review'?stored:weekHasData?'review':'timeline';
}
