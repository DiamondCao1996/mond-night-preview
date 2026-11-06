export const AGE_DISCLAIMER = 'Illustrative, from 10-second ECG population data, not transferable to overnight PPG. Not a percentile or diagnosis.';
// Shape-only illustration, not a fitted reference curve or validated normalization.
const curve = age => 48*Math.exp(-.013*(age-40));
export const illustrativeAgeCurve = () => Array.from({length:73},(_,i)=>({age:i+18,hrv:curve(i+18)}));
export function describeAgeComparison(age,userRmssd) {
  return {userRmssd,curveValue:curve(age),labelKey:'illustrative-ecg-not-ppg',disclaimer:AGE_DISCLAIMER};
}
