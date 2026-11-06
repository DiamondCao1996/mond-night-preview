export const EVIDENCE_STRENGTH_LABELS = Object.freeze({
  guideline: 'Guide',
  'meta-rct': 'Meta (RCT)',
  'meta-obs': 'Meta (obs)',
  review: 'Review',
  rct: 'RCT',
  observational: 'Obs',
  experimental: 'Exp',
  adjacent: 'Adj'
});

// A design badge describes study design, not certainty or a personal effect.
export function literatureCell(factor, target, lang = 'en') {
  if (!factor.association.targets.includes(target)) return {mapped: false};
  const direction = factor.association.byTarget?.[target] ?? factor.association.direction;
  const evidenceStrength = factor.evidenceStrength;
  const badge = EVIDENCE_STRENGTH_LABELS[evidenceStrength];
  const designs = factor.evidenceDesigns.map(d =>
    `${d.design}: ${d.detail[lang] || d.detail.en} ${d.citations.map(id => `[${id}]`).join(' ')}`
  ).join('; ');
  const title = `${badge} · ${target}: ${direction} · ${factor.association.note[lang] || factor.association.note.en} · ${designs}`;
  return {mapped: true, direction, evidenceStrength, badge, title};
}
