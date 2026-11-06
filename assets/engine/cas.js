import {keys,priors,mean,good,values,baselines} from './baselines.js';
const names=['observationQualityAgent','circadianSeasonAgent','sleepAgent','activityLoadAgent','behaviorEventAgent','personalDynamicsAgent'];
const clip=(x,a,b)=>Math.max(a,Math.min(b,x));
const limits=[[5,180],[30,120],[120,720],[0,40000]], noise=[3,1.5,25,1600];
const clock=s=>s?Number(s.split(':')[0])+Number(s.split(':')[1])/60:23;
// Context uses past observations only. Missingness remains in the shared timeline.
function context(history,date,state) {
  const last=history.at(-1), valid=history.filter(good), previous=valid.at(-1);
  let debt=0;
  history.slice(-7).forEach(n=>{debt=.65*debt+(good(n)&&Number.isFinite(n.sleepMinutes)?Math.max(0,state[2].mean-n.sleepMinutes):0);});
  const day=new Date(date), weekend=[0,6].includes(day.getUTCDay());
  const season=2*Math.cos(2*Math.PI*(day-new Date(`${day.getUTCFullYear()}-01-01T00:00Z`))/31557600000);
  const load=previous?Math.max(0,((previous.steps??8000)-8000)/3000):0;
  const event=(n)=>n?.events?.reduce((s,e)=>s+(['lateActivity','alcoholLogged'].includes(e.type)?1:0),0)||0;
  const delayed=event(last)+.35*event(history.at(-2));
  const timing=previous?Math.max(0,(clock(previous.wake)-clock(previous.bedtime)+24)%24-9):0;
  return [
    {agent:names[0],delta:[0,0,0,0],sigma:good(last||{})?1:2,reason:'quality'},
    {agent:names[1],delta:[-.2*timing,season,weekend?15:0,weekend?2400:0],sigma:1,reason:'timing'},
    {agent:names[2],delta:[-.032*debt,.012*debt,0,0],sigma:1,reason:'sleep'},
    {agent:names[3],delta:[-1.3*load,.5*load,0,0],sigma:1,reason:'activity'},
    {agent:names[4],delta:[-1.3*delayed,.5*delayed,0,0],sigma:1,reason:'events'},
    {agent:names[5],delta:[0,0,0,0],sigma:1,reason:'personal'}
  ];
}
function create(){return {state:priors.map((mean,i)=>({mean,variance:noise[i]**2*30})),errors:Object.fromEntries(names.map(n=>[n,5])),weights:Object.fromEntries(names.map(n=>[n,1/6]))};}
function predict(env,history,date,horizon=1){
  const contributions=context(history,date,env.state);
  // Adaptive reliability moderates contextual terms; normalized weights also exposed.
  const effects=keys.map((_,i)=>contributions.reduce((s,c)=>s+c.delta[i]*clip(env.weights[c.agent]*6,.5,1.5),0));
  const recent=history.slice(-7).filter(good).length;
  const forecast=Object.fromEntries(keys.map((k,i)=>{
    const m=clip(env.state[i].mean+effects[i],limits[i][0]+1,limits[i][1]-1);
    const sigma=Math.sqrt(env.state[i].variance+noise[i]**2)*(recent<4?2:1)*(good(history.at(-1)||{})?1:1.6)*Math.sqrt(horizon);
    return [k,{mean:m,lo:Math.min(m-.01,clip(m-1.96*sigma,...limits[i])),hi:Math.max(m+.01,clip(m+1.96*sigma,...limits[i])),unit:['ms','bpm','min','steps'][i]}];
  }));
  return {forecast,contributions,effects};
}
function assimilate(env,night,pred,adapt){
  if(!good(night)) {env.state.forEach((s,i)=>s.variance+=noise[i]**2*.15);return;}
  for(const c of pred.contributions){
    if(!Number.isFinite(night.hrvRmssdMs))continue;
    const candidate=env.state[0].mean+c.delta[0];
    env.errors[c.agent]=.85*env.errors[c.agent]+.15*Math.abs(night.hrvRmssdMs-candidate);
  }
  const total=names.reduce((s,n)=>s+1/(1+env.errors[n]),0);
  names.forEach(n=>env.weights[n]=(1/(1+env.errors[n]))/total);
  if(!adapt)return;
  keys.forEach((k,i)=>{
    if(!Number.isFinite(night[k]))return;
    const s=env.state[i], variance=s.variance+noise[i]**2*.015;
    const gain=variance/(variance+noise[i]**2);
    // Personal dynamics assimilates residuals after the other agents' expectations.
    s.mean+=gain*(night[k]-pred.effects[i]-s.mean);s.variance=(1-gain)*variance;
  });
}
export function runCAS(nights,{horizon=1,language='en',adapt=true}={}) {
  if(!Number.isInteger(horizon)||horizon<1)throw new RangeError('horizon must be a positive integer');
  const ns=nights.map(n=>({...n,date:new Date(n.date).toISOString().slice(0,10),events:n.events||[]}));
  for(let i=1;i<ns.length;i++)if(ns[i].date<=ns[i-1].date)throw new RangeError('Nights must be chronological with unique dates');
  const env=create(), burnIn=14, scores=Object.fromEntries(['cas','lastValue','personalAverage','ar1','noHrv'].map(n=>[n,{hrv:[],rhr:[],hc:[],rc:[]}])) ;
  ns.forEach((night,t)=>{
    const past=ns.slice(0,t), pred=predict(env,past,night.date);
    if(t>=burnIn && good(night)){
      const alternatives=baselines(past);
      for(const [name,s] of Object.entries(scores))for(const [k,prefix,cov] of [['hrvRmssdMs','hrv','hc'],['rhrBpm','rhr','rc']]){
        if(!Number.isFinite(night[k]))continue;
        const estimate=name==='cas'?pred.forecast[k].mean:alternatives[name][k];
        s[prefix].push(Math.abs(estimate-night[k]));
        if(name==='cas')s[cov].push(Number(night[k]>=pred.forecast[k].lo&&night[k]<=pred.forecast[k].hi));
      }
    }
    assimilate(env,night,pred,adapt);
  });
  const date=new Date(`${ns.at(-1)?.date||'2026-10-31'}T12:00Z`);date.setUTCDate(date.getUTCDate()+horizon);
  const pred=predict(env,ns,date.toISOString().slice(0,10),horizon), recent=ns.slice(-7).filter(good).length;
  const a=values(ns,'hrvRmssdMs'), variability=Math.sqrt(mean(a.map(v=>(v-mean(a))**2)));
  const width=pred.forecast.hrvRmssdMs.hi-pred.forecast.hrvRmssdMs.lo;
  const confidence=recent<4||width>Math.max(20,variability*8)?'low':recent>=6&&good(ns.at(-1)||{})?'high':'medium';
  const abstain=recent<4||confidence==='low'||(!good(ns.at(-1)||{})&&recent<6);
  const texts={en:['Only comparable, good-quality nights inform personal levels.','Timing and season give this sample a little context.','Shorter recent nights line up with a small downward HRV adjustment.','Recent activity contributes a delayed sample pattern.','Logged events contribute at the next night and one night later.','Personal levels adapt as comparable nights arrive.'], 'zh-CN':['个人基线仅使用可比且质量良好的夜晚。','时间与季节为示例提供背景。','近期较短的睡眠与略低的 HRV 预测相伴。','近期活动带来延迟的示例模式。','记录的事件参与随后两晚的估计。','可比夜晚逐渐更新个人基线。'],sv:['Bara jämförbara nätter med god datakvalitet formar personliga nivåer.','Tid och årstid ger exemplet sammanhang.','Kortare nätter sammanfaller med en liten nedjustering av HRV.','Senaste aktiviteten bidrar med ett fördröjt exempelmönster.','Loggade händelser ingår under de två följande nätterna.','Personliga nivåer anpassas med jämförbara nätter.']};
  const baseline=baselines(ns).personalAverage.hrvRmssdMs, delta=pred.forecast.hrvRmssdMs.mean-baseline;
  const trends={en:['The sample forecast is close to your recent personal average.','The sample forecast sits a little above your recent average.','The sample forecast sits a little below your recent average.'],'zh-CN':['示例预测接近近期个人平均值。','示例预测略高于近期平均值。','示例预测略低于近期平均值。'],sv:['Exempelprognosen ligger nära ditt senaste personliga snitt.','Exempelprognosen ligger lite över ditt senaste snitt.','Exempelprognosen ligger lite under ditt senaste snitt.']};
  return {nights:ns,forecast:pred.forecast,confidence,abstain,judgment:{trend:(trends[language]||trends.en)[Math.abs(delta)<2?0:delta>0?1:2],contributors:pred.contributions.map((c,i)=>({agent:c.agent,direction:c.delta[0]>0?'up':c.delta[0]<0?'down':'neutral',text:(texts[language]||texts.en)[i]})),suggestion:abstain?'none':null,observational:true},backtest:{burnIn,n:scores.cas.hrv.length,models:Object.fromEntries(Object.entries(scores).map(([n,s])=>[n,{hrvMae:s.hrv.length?mean(s.hrv):null,rhrMae:s.rhr.length?mean(s.rhr):null,...(n==='cas'?{hrvCoverage:s.hc.length?mean(s.hc):null,rhrCoverage:s.rc.length?mean(s.rc):null}:{})}]))},weights:env.weights,personalState:Object.fromEntries(keys.map((k,i)=>[k,{...env.state[i]}])),disclaimerKey:'sample-not-medical'};
}
