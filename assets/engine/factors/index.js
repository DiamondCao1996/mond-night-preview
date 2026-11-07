import hrv from './hrv.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import rhr from './rhr.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import sleep from './sleep.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import activity from './activity.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import age from './age.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import height from './height.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import education from './education.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import heartFailure from './heartFailure.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import mentalHealth from './mentalHealth.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import lifeExpectancy from './lifeExpectancy.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import diet from './diet.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import dailyHabits from './dailyHabits.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import sport from './sport.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import work from './work.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import reading from './reading.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import meditation from './meditation.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import timeOfDay from './timeOfDay.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import season from './season.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import {personalAssociation} from '../associations.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
import {describeAgeComparison} from '../ageTrend.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
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
export {EVIDENCE_STRENGTH_LABELS, literatureCell} from './labels.js?v=135e68fba5df30ade5cd1920aef10d008822562c';
