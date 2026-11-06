export const keys=['hrvRmssdMs','rhrBpm','sleepMinutes','steps'];
export const priors=[45,58,450,7000]; // Demonstration priors, not clinical reference values.
export const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
export const good=n=>n.quality==='good' && n.metric==='RMSSD' && n.window==='overnight' && n.device==='sample-ppg';
export const values=(ns,k)=>ns.filter(good).map(n=>n[k]).filter(Number.isFinite);
export function baselines(ns) {
  const result={lastValue:{},personalAverage:{},ar1:{},noHrv:{}};
  keys.forEach((k,i)=>{
    const a=values(ns,k), recent=a.slice(-7), m=recent.length?mean(recent):priors[i];
    result.lastValue[k]=a.at(-1)??priors[i]; result.personalAverage[k]=m;
    const center=mean(a), pairs=a.slice(1).map((v,j)=>[a[j]-center,v-center]);
    const denom=pairs.reduce((s,[x])=>s+x*x,0);
    const phi=Math.max(-.8,Math.min(.8,denom?pairs.reduce((s,[x,y])=>s+x*y,0)/denom:0));
    result.ar1[k]=a.length>3?center+phi*(a.at(-1)-center):m;
    result.noHrv[k]=m;
  });
  // This branch never reads HRV history: only independent RHR, sleep and activity.
  const r=values(ns,'rhrBpm').slice(-7), sl=values(ns,'sleepMinutes').slice(-7), st=values(ns,'steps').slice(-7);
  result.noHrv.hrvRmssdMs=45+(58-(r.length?mean(r):58))*.7+((sl.length?mean(sl):450)-450)*.025- Math.max(0,(mean(st)-8000)/4000);
  return result;
}
