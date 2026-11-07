import {EMOTION_WHEEL} from './emotionWheel.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {PMR_TRIGGER,pmrQuality} from './pmr.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import {invitationForEntry} from './firstAid.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
const day=86400000;
export const RECOMMENDATION_POLICY={low:.8,pmr:PMR_TRIGGER.dropFraction,high:1.2,currentMaxAge:15*60000,baselineMaxAge:30*day,trendMaxAge:7*day,emotionMaxAge:day};
const finitePositive=v=>Number.isFinite(v)&&v>0;
const median=a=>{const v=[...a].sort((a,b)=>a-b),m=Math.floor(v.length/2);return v.length?(v[m]+v[Math.floor((v.length-1)/2)])/2:null;};
// Match the quiet-reference 180-second window, not the live card's 300-second metric.
export function currentRmssd(session){
 if(typeof session?.session_id!=='string'||!session.session_id||typeof session?.device!=='string'||!session.device||!pmrQuality(session))return null;
 const rows=session.series.filter(r=>r.time_s>=session.elapsed-PMR_TRIGGER.windowSeconds),squares=[];
 if(rows.some(r=>!Number.isInteger(r.event_index)||r.event_index<0||(r.corrected_ms!=null&&(!Number.isFinite(r.corrected_ms)||r.corrected_ms<300||r.corrected_ms>2000))))return null;
 for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if(finitePositive(a.corrected_ms)&&finitePositive(b.corrected_ms)&&Number.isInteger(a.event_index)&&b.event_index-a.event_index===1)squares.push((b.corrected_ms-a.corrected_ms)**2);}
 const value=squares.length>=30?Math.sqrt(squares.reduce((s,v)=>s+v,0)/squares.length):null;
 return Number.isFinite(value)?value:null;
}
function fresh(time,now,max){return Number.isFinite(time)&&time<=now&&now-time<=max;}
export function qualifiedBaseline(profile,session,now=Date.now()){
 const samples=profile?.baselines?.sensor;
 return median((Array.isArray(samples)?samples:[]).filter(s=>s?.mode==='sensor'&&typeof s.id==='string'&&s.id&&s.version===PMR_TRIGGER.processingVersion&&s.window===180&&typeof s.device==='string'&&s.device===session?.device&&s.id!==session?.session_id&&fresh(s.saved_at,now,RECOMMENDATION_POLICY.baselineMaxAge)&&Number.isFinite(s.altered)&&s.altered<=.05&&s.altered>=0&&Number.isInteger(s.stats?.successive_pairs)&&s.stats.successive_pairs>=30&&['rmssd_ms','sdnn_ms','mean_hr_bpm'].every(k=>finitePositive(s.stats?.[k]))).map(s=>s.stats.rmssd_ms));
}
export function sensorEvidence({moment,profile,history=[],now=Date.now()}={}){
 const session=moment?.session;
 if(!moment||!Number.isFinite(moment.saved_at)||!fresh(moment.saved_at*1000,now,RECOMMENDATION_POLICY.currentMaxAge))return {status:moment?'stale':'absent',trend:null};
 const current=currentRmssd(session);
 if(current===null)return {status:'poor',trend:null};
 const baseline=qualifiedBaseline(profile,session,now);
 if(!baseline)return {status:'no-baseline',current,trend:null};
 const seen=new Set([session.session_id]);
 const past=(Array.isArray(history)?history:[]).filter(m=>m&&m.saved_at<moment.saved_at&&fresh(m.saved_at*1000,now,RECOMMENDATION_POLICY.trendMaxAge)&&m.session?.device===session.device&&m.session?.session_id&&!seen.has(m.session.session_id)&&currentRmssd(m.session)!==null&&(seen.add(m.session.session_id),true)).sort((a,b)=>a.saved_at-b.saved_at).slice(-3);
 const prior=median(past.map(m=>currentRmssd(m.session))),trend=past.length>=2&&prior>0?(current<prior*.8?'lower':current>prior*1.2?'higher':'steady'):null;
 const ratio=current/baseline;
 return {status:ratio<=RECOMMENDATION_POLICY.low?'low':ratio>RECOMMENDATION_POLICY.high?'high':'near',current,baseline,ratio,trend};
}
export function latestEmotion(entries,now=Date.now()) {return (Array.isArray(entries)?entries:[]).filter(e=>fresh(Date.parse(e?.utc),now,RECOMMENDATION_POLICY.emotionMaxAge)).sort((a,b)=>Date.parse(b.utc)-Date.parse(a.utc))[0];}
function rootFor(id){const contains=n=>n.id===id||(n.children||[]).some(contains);return EMOTION_WHEEL.find(contains)?.id;}
export function recommend({moment,profile,history,entry,state,unsafe=false,now=Date.now()}={}){
 const evidence=sensorEvidence({moment,profile,history,now});
 // New explicit state can supersede an older mild log, never an intense invitation.
 const aid=invitationForEntry(entry),core=rootFor(entry?.path?.[0]?.id),negative=['anger','fear','disgust','sadness','low'].includes(core),intense=negative&&Number.isInteger(entry?.intensity)&&entry.intensity>=4&&entry.intensity<=5;
 let primary='senses',reason='default',alternatives=['stop'];
 if(unsafe||entry?.unsafe===true||intense){primary='safe-space';reason=intense?'intense':'unsafe';alternatives=['senses',...(aid?.primary?.id==='forest-leaves'?['forest']:['stop'])];}
 else if(aid){primary=aid.primary.id==='forest-leaves'?'forest':'safe-space';reason='emotion';alternatives=['stop','safe-space'];}
 else if(evidence.status==='low'||(evidence.status==='high'&&evidence.trend==='lower')){primary=evidence.ratio<=RECOMMENDATION_POLICY.pmr?'relax':'finger-breathing';reason=evidence.status==='low'?'sensor-low':'trend-lower';alternatives=['body-scan','senses'];}
 else if(state==='tense'){primary='finger-breathing';reason='tense';alternatives=['senses','stop'];}
 else if(state==='low'||(!state&&['sadness','low'].includes(core))){primary='energy-menu';reason='low';alternatives=['gratitude','body-scan'];}
 else if(state==='scattered'){primary='stop';reason='scattered';alternatives=['senses'];}
 else if(state==='numb'){primary='senses';reason='numb';alternatives=['body-scan'];}
 else if(evidence.status==='near'){primary='reframe';reason='sensor-near';alternatives=['awareness','review'];}
 else if(evidence.status==='high'){primary='actions';reason='sensor-high';alternatives=['vision','pearls'];}
 else if(state==='okay'||(!state&&['joy','surprise'].includes(core))){primary='pearls';reason='okay';alternatives=['gratitude','actions'];}
 else if(moment){reason=evidence.status;}
 const notes=[reason];if(evidence.trend)notes.push(`trend-${evidence.trend}`);
 return {primary,alternatives:[...new Set(alternatives)].filter(r=>r!==primary).slice(0,2),reason,reasons:notes,evidence};
}
