import {EMOTION_WHEEL} from './emotionWheel.js';
import {loadEmotions,saveEmotions} from './store.js';
export const localDate=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function addEmotion(entry={}) {
  let nodes=EMOTION_WHEEL;
  if(!Array.isArray(entry.path)||!entry.path.length||entry.path.length>3)throw new TypeError('Choose an emotion path');
  const path=entry.path.map(part=>{const node=nodes.find(n=>n.id===part.id);if(!node)throw new TypeError('Invalid emotion trail');nodes=node.children;return {id:node.id,zh:node.zh,en:node.en};});
  const utc=entry.utc||new Date().toISOString();
  if(!Number.isFinite(Date.parse(utc)))throw new TypeError('Invalid timestamp');
  const saved={id:entry.id||globalThis.crypto?.randomUUID?.()||`emotion-${Date.now()}-${Math.random().toString(36).slice(2)}`,utc:new Date(utc).toISOString(),date:entry.date||localDate(new Date(utc)),path};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(saved.date)||!Number.isFinite(Date.parse(saved.date)))throw new TypeError('Invalid date');
  if(Number.isInteger(entry.intensity)&&entry.intensity>=1&&entry.intensity<=5)saved.intensity=entry.intensity;
  if(typeof entry.note==='string'&&entry.note.trim())saved.note=entry.note.trim();
  const entries=[...loadEmotions(),saved];saveEmotions(entries);return entries;
}
export function deleteEmotion(id){const entries=loadEmotions();const i=entries.findIndex(e=>e.id===id);if(i>=0)entries.splice(i,1);saveEmotions(entries);return entries;}
export function emotionDistribution(entries,{days=7,now=new Date()}={}){
  if(![7,30].includes(days))throw new RangeError('Use 7 or 30 days');
  const end=new Date(now),start=new Date(now);start.setDate(start.getDate()-days+1);
  const counts=Object.fromEntries(EMOTION_WHEEL.map(n=>[n.id,0]));
  for(const e of entries)if(e.date>=localDate(start)&&e.date<=localDate(end)&&Object.hasOwn(counts,e.path?.[0]?.id))counts[e.path[0].id]++;
  return counts;
}
// Same-date join: a night is labeled by its starting local date. No row-based lag.
// Compare only nights following a day with ANY check-in, within the same device,
// metric and overnight window. Missing check-ins are never treated as a control.
export function exploreEmotionAssociations(nights,entries,{metric='hrvRmssdMs'}={}){
  if(!['hrvRmssdMs','sleepMinutes'].includes(metric))throw new RangeError('Unsupported metric');
  const dates=new Map();for(const e of entries){if(!dates.has(e.date))dates.set(e.date,new Set());dates.get(e.date).add(e.path?.[0]?.id);}
  const eligible=(nights||[]).filter(n=>dates.has(n.date)&&n.quality==='good'&&n.metric==='RMSSD'&&n.window==='overnight'&&n.device&&Number.isFinite(n[metric]));
  const devices=[...new Set(eligible.map(n=>n.device))];
  const groups=Object.fromEntries(EMOTION_WHEEL.map(core=>{
    // Never pool different devices; use the largest comparable device series.
    const series=devices.map(device=>eligible.filter(n=>n.device===device)).sort((a,b)=>b.length-a.length)[0]||[];
    const a=series.filter(n=>dates.get(n.date).has(core.id)),b=series.filter(n=>!dates.get(n.date).has(core.id));
    const base={status:'not-enough-data',nWith:a.length,nWithout:b.length,minN:5};
    if(a.length>=5&&b.length>=5){const mean=x=>x.reduce((s,n)=>s+n[metric],0)/x.length;Object.assign(base,{status:'ok',meanWith:mean(a),meanWithout:mean(b),delta:mean(a)-mean(b)});}
    return [core.id,base];
  }));
  return {status:Object.values(groups).some(g=>g.status==='ok')?'ok':'not-enough-data',metric,join:'same-date (night starting on check-in date)',groups};
}
