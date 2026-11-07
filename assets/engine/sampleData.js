import {eventDelta} from './events.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
// Synthetic correlated nights, not participant data. UTC avoids host timezone drift.
export function generateSampleNights({seed=20261031,count=42,endDate=null}={}) {
  let s=seed>>>0;
  const random=()=>{s=(1664525*s+1013904223)>>>0; return s/4294967296;};
  const end=new Date(`${endDate ? String(endDate instanceof Date ? endDate.toISOString().slice(0,10) : endDate).slice(0,10) : '2026-10-31'}T12:00:00Z`);
  let debt=0, previousLoad=0, priorEvents=[], olderEvents=[];
  return Array.from({length:count},(_,i)=>{
    const d=new Date(end); d.setUTCDate(d.getUTCDate()-count+1+i);
    const weekend=[0,6].includes(d.getUTCDay()), late=i%9===4, alcohol=i%4===1;
    const sleep=Math.round(465+(weekend?15:0)- (late?65:0)+(random()-.5)*36);
    const steps=Math.round(7300+(weekend?2400:0)+(random()-.5)*2400);
    const season=2*Math.cos(2*Math.PI*(d-new Date(`${d.getUTCFullYear()}-01-01T00:00Z`))/31557600000);
    const effect=eventDelta(priorEvents).map((v,j)=>v+.35*eventDelta(olderEvents)[j]);
    const hrv=64+effect[0]-.032*debt-previousLoad*1.3+(random()-.5)*4;
    const rhr=53+effect[1]+season+.012*debt+previousLoad*.5+(random()-.5)*1.6;
    const quality=[8,22,33].includes(i)?'missing':[5,18,29].includes(i)?'poor':'good';
    const events=[...(weekend?[{type:'weekend'}]:[]),...(late?[{type:'lateActivity',startOffsetHours:-2}]:[]),...(alcohol?[{type:'alcoholLogged',startOffsetHours:-3}]:[]),...(debt>30?[{type:'shortPriorSleep'}]:[])];
    for(const [type,period,offset] of [['lateMeal',6,2],['slowBreathing',5,2],['workout',4,0],['workStrain',7,1],['workBreak',5,3],['reading',5,0],['meditation',31,12]])if(i%period===offset)events.push({type});
    olderEvents=priorEvents;priorEvents=events;
    debt=.65*debt+Math.max(0,465-sleep); previousLoad=Math.max(0,(steps-8000)/3000);
    const missing=quality==='missing';
    return {date:d.toISOString().slice(0,10),hrvRmssdMs:missing?null:+hrv.toFixed(1),rhrBpm:missing?null:+rhr.toFixed(1),sleepMinutes:missing?null:sleep,bedtime:weekend?'00:15':late?'00:05':'23:10',wake:weekend?'08:20':'07:10',efficiencyPct:missing?null:93,steps:missing?null:steps,activeMinutes:missing?null:Math.round(steps/190),quality,device:'sample-ppg',window:'overnight',metric:'RMSSD',events};
  });
}
