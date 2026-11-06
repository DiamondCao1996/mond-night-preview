import {clearInnerReview} from './innerReview.js';
const memory = new Map();
const key = name => `mond-factors-${name}`;
function read(name, fallback) {
  try { const raw = typeof localStorage!=='undefined' ? localStorage.getItem(key(name)) : memory.get(key(name)); return raw ? JSON.parse(raw) : fallback; } catch {return fallback;}
}
function changed() {if (typeof window!=='undefined') window.dispatchEvent(new Event('mond-data-change'));}
function write(name, value) {
  const raw=JSON.stringify(value);
  if (typeof localStorage!=='undefined') localStorage.setItem(key(name),raw); else memory.set(key(name),raw);
  changed();
}
export const loadEmotions=()=>{const v=read('emotions',[]);return Array.isArray(v)?v:[];};
export const saveEmotions=entries=>write('emotions',entries);
export const loadFirstAid=()=>{const v=read('first-aid',[]);return Array.isArray(v)?v:[];};
export const saveFirstAid=entries=>write('first-aid',entries);
export const loadPmr=()=>{const v=read('pmr',[]);return Array.isArray(v)?v:[];};
export const savePmr=entries=>write('pmr',entries);
export const loadProfile=()=>read('profile',{});
export const saveProfile=p=>write('profile',p);
export const loadLogs=()=>{const v=read('logs',[]);return Array.isArray(v)?v:[];};
export const saveLogs=logs=>write('logs',logs);
export function loadNights() {
  const v=read('nights',null);
  return Array.isArray(v)&&v.length&&v.every((n,i)=>/^\d{4}-\d{2}-\d{2}$/.test(n.date)&&!isNaN(Date.parse(n.date))&&Array.isArray(n.events)&&typeof n.device==='string'&&n.device.length>0&&n.metric==='RMSSD'&&n.window==='overnight'&&['good','poor','missing'].includes(n.quality)&&['hrvRmssdMs','rhrBpm','sleepMinutes','steps'].every(k=>n[k]===null||n[k]===undefined||Number.isFinite(n[k]))&&(!i||n.date>v[i-1].date))?v:null;
}
export const saveImportedNights=n=>write('nights',n);
export function clearAllFactorData() {
  for(const name of ['profile','logs','nights','emotions','first-aid','pmr']) {memory.delete(key(name)); if(typeof localStorage!=='undefined')localStorage.removeItem(key(name));}
  clearInnerReview();
  changed();
}
export function mergeLogsIntoNights(nights,logs) {
  return nights.map(n=>({...n,events:[...new Map([...(n.events||[]),...logs.filter(l=>l.date===n.date).flatMap(l=>(l.types||[]).map(type=>({type,source:'user-log'})))].map(e=>[e.type,{...e}])).values()]}));
}
