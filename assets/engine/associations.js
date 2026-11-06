import {good, mean} from './baselines.js';
export const DEFAULT_EXPOSURES = ['lateMeal','alcoholLogged','slowBreathing','workout','workStrain','workBreak','reading','meditation','lateActivity'];
const shift = (date, days) => new Date(Date.parse(`${date}T12:00Z`) + days*86400000).toISOString().slice(0,10);
// Calendar lag, never row lag: missing dates must not change the exposure window.
// Intervals are descriptive normal approximations, not causal or multiplicity-adjusted.
export function personalAssociation(nights, {exposure, metric='hrvRmssdMs', lagNights=1, minN=5}={}) {
  if (!Number.isInteger(lagNights) || lagNights < 0) throw new RangeError('Invalid lag');
  const byDate = new Map(nights.map(n => [n.date,n])), withValues=[], withoutValues=[];
  for (const night of nights) {
    if (!good(night) || !Number.isFinite(night[metric])) continue;
    const prior = byDate.get(shift(night.date,-lagNights));
    if (!prior) continue;
    // Absence means no such logged event, not confirmed abstention.
    (prior.events?.some(e => e.type===exposure) ? withValues : withoutValues).push(night[metric]);
  }
  const nWith=withValues.length, nWithout=withoutValues.length;
  if (nWith<minN || nWithout<minN) return {status:'not-enough-data',nWith,nWithout,minN};
  const meanWith=mean(withValues),meanWithout=mean(withoutValues),delta=meanWith-meanWithout;
  const variance=a=>a.reduce((s,v)=>s+(v-mean(a))**2,0)/(a.length-1);
  const se=Math.sqrt(variance(withValues)/nWith+variance(withoutValues)/nWithout);
  return {status:'ok',nWith,nWithout,meanWith,meanWithout,delta,lo:delta-1.96*se,hi:delta+1.96*se,se};
}
export const associationsFromLogs = (nights, exposures=DEFAULT_EXPOSURES) => Object.fromEntries(exposures.map(exposure=>[exposure,personalAssociation(nights,{exposure})]));
