import {loadPmr,savePmr} from './store.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {localDate} from './emotionLog.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {invitationView} from './firstAid.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
export const PMR_TRIGGER={dropFraction:0.5,processingVersion:'mond-causal-1.1',windowSeconds:180,minSuccessivePairs:30,maxAlteredRatio:0.1,edgeToleranceSeconds:5,maxGapSeconds:6};
export const PMR_ZONES=[['forehead','额头与眉毛','Forehead and eyebrows','Panna och ögonbryn'],['jaw','下颌与嘴唇','Jaw and lips','Käke och läppar'],['shoulders','肩膀与颈部','Shoulders and neck','Axlar och nacke'],['chest','胸部','Chest','Bröst'],['arms','上臂','Upper arms','Överarmar'],['hands','手部与前臂','Hands and forearms','Händer och underarmar'],['abdomen','腹部','Abdomen','Mage'],['thighs','大腿','Thighs','Lår'],['calves','小腿','Calves','Vader'],['feet','脚部','Feet','Fötter']].map(([id,zh,en,sv])=>({id,zh,en,sv}));
export const PMR_STEPS=[{zh:'① 吸气收紧（紧绷肌肉 5 秒）',en:'① Breathe in and tense gently (5 seconds)',sv:'① Andas in och spänn varsamt (5 sekunder)'},{zh:'② 呼气释放（逐渐放松，并觉察放松的感觉）',en:'② Breathe out and release gradually, noticing relaxation',sv:'② Andas ut och släpp gradvis, lägg märke till avslappningen'},{zh:'③ 停顿片刻，体会变化和放松感',en:'③ Pause and notice the change and relaxation',sv:'③ Pausa och känn förändringen och avslappningen'}];
export function sensorBaseline(profile){
 const samples=profile?.baselines?.sensor;
 const valid=(Array.isArray(samples)?samples:[]).filter(s=>s&&s.mode==='sensor'&&s.version===PMR_TRIGGER.processingVersion&&s.window===PMR_TRIGGER.windowSeconds&&['rmssd_ms','sdnn_ms','mean_hr_bpm'].every(k=>Number.isFinite(s.stats?.[k])));
 return valid.length?valid.reduce((sum,s)=>sum+s.stats.rmssd_ms,0)/valid.length:null;
}
export function pmrQuality(session){
 const s=session,c=PMR_TRIGGER;
 if(!s||s.mode!=='sensor'||s.status!=='connected'||s.stale||s.warming||s.processing_version!==c.processingVersion||(!Number.isFinite(s.metrics?.rmssd)||s.metrics.rmssd<0)||!Number.isFinite(s.elapsed)||s.elapsed<c.windowSeconds||!Array.isArray(s.series))return false;
 const rows=s.series.filter(r=>r.time_s>=s.elapsed-c.windowSeconds);
 if(!rows.length||rows.some(r=>!Number.isFinite(r.time_s)||r.time_s>s.elapsed)||rows[0].time_s>s.elapsed-c.windowSeconds+c.edgeToleranceSeconds||s.elapsed-rows.at(-1).time_s>c.edgeToleranceSeconds||rows.at(-1).time_s-rows[0].time_s<c.windowSeconds-c.edgeToleranceSeconds)return false;
 if(rows.some((r,i)=>i&&(r.time_s<rows[i-1].time_s||r.time_s-rows[i-1].time_s>c.maxGapSeconds))||rows.filter(r=>r.action!=='unchanged').length/rows.length>c.maxAlteredRatio)return false;
 let pairs=0;for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if(Number.isFinite(a.corrected_ms)&&a.corrected_ms>0&&Number.isFinite(b.corrected_ms)&&b.corrected_ms>0&&b.event_index-a.event_index===1)pairs++;}
 return pairs>=c.minSuccessivePairs;
}
export function shouldOfferPmr({session,profile}={}){const baseline=sensorBaseline(profile);return pmrQuality(session)&&baseline>0&&session.metrics.rmssd<=baseline*PMR_TRIGGER.dropFraction;}
export function momentInvitation({session,profile,entry}={}){const aid=invitationView(entry);return shouldOfferPmr({session,profile})?{primary:{id:'pmr'},alternative:aid?.primary||null,dismiss:true}:aid;}
export {loadPmr};
export function savePmrCompletion(input={}){
 const ids=PMR_ZONES.map(z=>z.id),completed=input.completedZoneIds,skipped=input.skippedZoneIds;
 if(input.practice!=='pmr'||!['home','invitation'].includes(input.source)||!Array.isArray(completed)||!Array.isArray(skipped)||new Set([...completed,...skipped]).size!==ids.length||[...completed,...skipped].length!==ids.length||[...completed,...skipped].some(id=>!ids.includes(id)))throw new TypeError('Invalid PMR completion');
 const utc=new Date().toISOString(),saved={practice:'pmr',utc,date:localDate(),completedZoneIds:[...completed],skippedZoneIds:[...skipped],source:input.source,note:String(input.note||'').trim().slice(0,1000),tags:(input.tags||[]).filter(t=>['body','connection','care'].includes(t)),wandering:String(input.wandering||'').trim().slice(0,1000)};
 savePmr([...loadPmr(),saved]);return saved;
}
