import hrv from './hrv.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import rhr from './rhr.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import sleep from './sleep.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import activity from './activity.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import age from './age.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import height from './height.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import education from './education.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import heartFailure from './heartFailure.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import mentalHealth from './mentalHealth.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import lifeExpectancy from './lifeExpectancy.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import diet from './diet.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import dailyHabits from './dailyHabits.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import sport from './sport.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import work from './work.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import reading from './reading.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import meditation from './meditation.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import timeOfDay from './timeOfDay.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import season from './season.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {personalAssociation} from '../associations.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
import {describeAgeComparison} from '../ageTrend.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
export const FACTORS = [hrv,rhr,sleep,activity,age,height,education,heartFailure,mentalHealth,lifeExpectancy,diet,dailyHabits,sport,work,reading,meditation,timeOfDay,season];
export const getFactor = id => FACTORS.find(f => f.id === id);
const forbidden = /^(riskScore|diagnosis|yearsOfLife|lifeExpectancyYears|survivalProbability|hazard|clinicalRisk|individualRiskScore|lifeExpectancyPrediction)$/i;
export function assertSafeFactorOutput(factor, payload) {
  if (!factor) throw new Error('Unknown factor');
  if (factor.outputType === 'evidence-only' || factor.modelRole === 'separate-pathway') {
    const walk = value => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        if (forbidden.test(key.replace(/[-_]/g,''))) throw new Error(`Forbidden clinical output: ${key}`);
        walk(child);
      }
    };
    walk(payload);
  }
  return payload;
}
export function evaluateFactor(id, ctx = {}) {
  const factor = getFactor(id);
  if (!factor) throw new Error(`Unknown factor: ${id}`);
  let result = {type:factor.outputType, factor, evidence:factor.evidence, limits:factor.limits, citations:factor.citations};
  if (factor.outputType !== 'evidence-only') {
    if (factor.role === 'behavior' && ctx.exposure) result.association = personalAssociation(ctx.nights || [], {exposure:ctx.exposure});
    if (id === 'age' && Number.isFinite(ctx.profile?.age)) result.comparison = describeAgeComparison(ctx.profile.age, ctx.userRmssd);
  }
  return assertSafeFactorOutput(factor, result);
}
export {EVIDENCE_STRENGTH_LABELS, literatureCell} from './labels.js?v=0bcdcddca02079702dc4a0b570473fccc7bacdca';
