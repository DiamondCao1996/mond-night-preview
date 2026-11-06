// Version 1 measurement schema documented in ENGINE.md. Provenance is retained.
const required=['utc','timezone','device','metric','unit','value','window','quality'];
const fields={RMSSD:['hrvRmssdMs','ms'],RHR:['rhrBpm','bpm'],sleep:['sleepMinutes','min'],activity:['steps','steps']};
const validTime=s=>{
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)||!Number.isFinite(Date.parse(s)))return false;
 const day=new Date(s.slice(0,10));return Number.isFinite(day.getTime())&&s.slice(0,10)===day.toISOString().slice(0,10);
};
function localDate(utc,timezone) {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(utc));
 return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
}
function csvRows(text) {
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++) {const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(cell.replace(/\r$/,''));cell='';if(c==='\n'){rows.push(row);row=[];}}else cell+=c;}
 if(quoted)throw new Error('Unclosed CSV quote');
 row.push(cell.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);
 const head=rows.shift()?.map(x=>x.trim())||[];
 return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??''])));
}
export function parseImport(text,{format='auto'}={}) {
 const errors=[],warnings=[],events=[],groups=new Map();let data;
 try {
  if(format==='auto')format=/^\s*[{[]/.test(text)?'json':'csv';
  if(format==='json'){data=JSON.parse(text);if(!data||typeof data!=='object')throw new Error('Expected version 1 object');if(data.version!==1)errors.push('Expected version: 1');if(!Array.isArray(data.measurements))errors.push('measurements must be an array');}
  else if(format==='csv'){const rows=csvRows(text);data={measurements:rows.filter(r=>!r.type),events:rows.filter(r=>r.type)};}
  else throw new Error('Unknown format');
 }catch(e){return {ok:false,nights:[],events:[],errors:[e.message],warnings};}
 for(const [i,m] of (Array.isArray(data.measurements)?data.measurements:[]).entries()) {
  const label=`Measurement ${i+1}`;
  if(!m||typeof m!=='object'){errors.push(`${label}: expected measurement object`);continue;}
  const absent=required.filter(k=>m[k]===undefined||m[k]===null||m[k]==='');
  if(absent.length){errors.push(`${label}: missing ${absent.join(', ')}`);continue;}
  if(!validTime(m.utc)){errors.push(`${label}: invalid UTC timestamp`);continue;}
  let date;try{date=localDate(m.utc,m.timezone);}catch{errors.push(`${label}: invalid timezone`);continue;}
  if(/sdnn/i.test(m.metric)){errors.push(`${label}: cannot mix SDNN with RMSSD`);continue;}
  const spec=fields[m.metric];if(!spec){errors.push(`${label}: unsupported metric; HRV must be RMSSD`);continue;}
  if(!['number','string'].includes(typeof m.value)||String(m.value).trim()===''||!Number.isFinite(Number(m.value))){errors.push(`${label}: non-numeric value`);continue;}
  if(m.unit!==spec[1]){errors.push(`${label}: expected unit ${spec[1]}`);continue;}
  if(!['good','poor','missing'].includes(m.quality)){errors.push(`${label}: invalid quality`);continue;}
  if(m.durationSeconds!==undefined&&m.durationSeconds!==''&&(!Number.isFinite(Number(m.durationSeconds))||Number(m.durationSeconds)<=0)){errors.push(`${label}: invalid durationSeconds`);continue;}
  if(m.window!=='overnight'){warnings.push(`${label}: ${m.window} excluded; cannot mix paced-breathing or resting with overnight`);continue;}
  let n=groups.get(date);
  if(!n){n={date,metric:'RMSSD',window:'overnight',device:m.device,quality:m.quality,hrvRmssdMs:null,rhrBpm:null,sleepMinutes:null,steps:null,events:[],measurements:[]};groups.set(date,n);}
  if(n.device!==m.device){errors.push(`${label}: different devices on same date cannot be pooled`);continue;}
  if(n[spec[0]]!==null){errors.push(`${label}: duplicate metric on local date`);continue;}
  n[spec[0]]=m.quality==='missing'?null:Number(m.value);n.measurements.push({...m,value:Number(m.value)});
  if(m.quality!=='good')n.quality=m.quality;
 }
 if(data.events!==undefined&&!Array.isArray(data.events))errors.push('events must be an array');
 for(const [i,e] of (Array.isArray(data.events)?data.events:[]).entries()) {
  if(!e||!e.type||!validTime(e.utc)){errors.push(`Event ${i+1}: type and valid utc required`);continue;}
  if(e.durationMinutes!==undefined&&e.durationMinutes!==''&&(!Number.isFinite(Number(e.durationMinutes))||Number(e.durationMinutes)<0)){errors.push(`Event ${i+1}: invalid durationMinutes`);continue;}
  events.push({...e});
  // Prefer explicit event timezone, otherwise the measurement's timezone; never use host timezone.
  const zones=[...new Set([...groups.values()].flatMap(n=>n.measurements.map(m=>m.timezone)))];
  if(!e.timezone&&zones.length>1){warnings.push(`Event ${i+1}: ambiguous timezone, not merged`);continue;}
  try{groups.get(localDate(e.utc,e.timezone||zones[0]||'UTC'))?.events.push({...e});}catch{errors.push(`Event ${i+1}: invalid timezone`);}
 }
 const nights=[...groups.values()].sort((a,b)=>a.date.localeCompare(b.date));
 if(!nights.length)errors.push('No overnight measurements to import');
 if(nights.some(n=>n.device!=='sample-ppg'))warnings.push('Device provenance retained: only sample-ppg is currently comparable for CAS and personal associations.');
 return {ok:!errors.length,nights,events,errors,warnings};
}
export function exportTimeline(nights,{format='json'}={}) {
 const measurements=nights.flatMap(n=>n.measurements||Object.entries(fields).filter(([metric,s])=>Number.isFinite(n[s[0]])||(metric==='RMSSD'&&n.quality==='missing')).map(([metric,[field,unit]])=>({utc:`${n.date}T12:00:00Z`,timezone:'UTC',device:n.device,metric,unit,value:n[field]??0,window:n.window,quality:n.quality})));
 const events=nights.flatMap(n=>(n.events||[]).map(e=>({...e,utc:e.utc||`${n.date}T12:00:00Z`,timezone:e.timezone||n.measurements?.[0]?.timezone||'UTC'})));
 if(format==='json')return JSON.stringify({version:1,measurements,events},null,2);
 if(format!=='csv')throw new Error('Unknown export format');
 const columns=[...required,'durationSeconds','type','durationMinutes','note'];
 const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
 return [columns.join(','),...[...measurements,...events].map(r=>columns.map(c=>quote(r[c])).join(','))].join('\n');
}
