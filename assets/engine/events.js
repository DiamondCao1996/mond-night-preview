// Hand-set demonstration associations, not estimated causal effects or action rankings.
export const EVENT_DELTAS={lateActivity:[-1.3,.5,-3,0],alcoholLogged:[-1.8,.7,-4,0],lateMeal:[-.7,.2,-3,0],slowBreathing:[.3,-.1,0,0],workout:[-.6,.2,3,0],workStrain:[-.8,.3,-3,0],workBreak:[.3,-.1,0,0],reading:[.2,0,4,0],meditation:[.2,0,0,0]};
export const eventDelta=(events=[])=>events.reduce((sum,e)=>sum.map((v,i)=>v+(EVENT_DELTAS[e.type]?.[i]||0)),[0,0,0,0]);
