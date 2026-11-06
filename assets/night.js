// Illustrative fixtures only. No sensor data or overnight recording is used.
const copy = {
  en: {
    nav: 'My nights', kicker: 'YOUR QUIETER NIGHTS', title: 'My nights.', sample: 'Sample nights',
    intro: 'Example nights to preview the layout, not recordings from a sensor.',
    last: 'Last night', hrv: 'Nightly HRV', rhr: 'Resting heart rate', sleep: 'Sleep', activity: 'Activity',
    ms: 'ms', bpm: 'bpm', steps: 'steps', active: 'active minutes', efficiency: 'efficiency',
    above: 'A little above your other sample nights', below: 'A little below your other sample nights', close: 'Close to your other sample nights',
    baseline: 'Each trend shows seven sample nights, ending last night. Comparisons use the median of the previous six sample nights; sleep compares duration and activity compares steps.',
    from: 'A QUIET NOTE FROM {name}', message: 'I saved a quiet picture of last night for you.', note: 'A few little details, with room for your own story.',
    disclaimer: 'These numbers are sample illustrations, not a measure of sleep quality, recovery, stress, or health. Overnight sensor recording is not implemented in this preview.',
    trend: '{label}: seven sample nights', hours: 'h', minutes: 'm',
    animals: ['Fox', 'Otter', 'Lion', 'Tiger', 'Bunny', 'Capybara', 'Cat', 'Panda', 'Koala']
  },
  'zh-CN': {
    nav: '我的夜晚', kicker: '你的安静夜晚', title: '我的夜晚。', sample: '示例数据',
    intro: '这些示例夜晚仅用于预览界面，并非传感器记录。',
    last: '昨晚', hrv: '夜间 HRV', rhr: '静息心率', sleep: '睡眠', activity: '活动',
    ms: '毫秒', bpm: '次/分', steps: '步', active: '分钟活动', efficiency: '效率',
    above: '比其他示例夜晚略高', below: '比其他示例夜晚略低', close: '与其他示例夜晚接近',
    baseline: '每条趋势展示截至昨晚的七个示例夜晚。比较基于前六个示例夜晚的中位数；睡眠比较时长，活动比较步数。',
    from: '来自{name}的轻声留言', message: '我为你留住了昨晚的一幅安静小画面。', note: '几处小细节，也为你的故事留一点空间。',
    disclaimer: '这些数字仅为示例，并不衡量睡眠质量、恢复、压力或健康状况。本预览尚未实现传感器整夜记录功能。',
    trend: '{label}：七个示例夜晚', hours: '小时', minutes: '分',
    animals: ['狐狸', '水獭', '狮子', '老虎', '兔子', '卡皮巴拉', '小猫', '熊猫', '考拉']
  },
  sv: {
    nav: 'Mina nätter', kicker: 'DINA LUGNARE NÄTTER', title: 'Mina nätter.', sample: 'Exempelnätter',
    intro: 'Exempelnätter som visar layouten, inga inspelningar från en sensor.',
    last: 'I natt', hrv: 'Nattlig HRV', rhr: 'Vilopuls', sleep: 'Sömn', activity: 'Aktivitet',
    ms: 'ms', bpm: 'slag/min', steps: 'steg', active: 'aktiva minuter', efficiency: 'effektivitet',
    above: 'Lite över dina andra exempelnätter', below: 'Lite under dina andra exempelnätter', close: 'Nära dina andra exempelnätter',
    baseline: 'Varje trend visar sju exempelnätter fram till i natt. Jämförelserna använder medianen för de föregående sex exempelnätterna; sömn jämför längd och aktivitet jämför steg.',
    from: 'EN STILLA HÄLSNING FRÅN {name}', message: 'Jag sparade en stilla bild av natten åt dig.', note: 'Några små detaljer, med plats för din egen berättelse.',
    disclaimer: 'Siffrorna är exempel och mäter inte sömnkvalitet, återhämtning, stress eller hälsa. Inspelning med sensor under natten finns inte i den här förhandsvisningen.',
    trend: '{label}: sju exempelnätter', hours: 'h', minutes: 'min',
    animals: ['Räven', 'Uttern', 'Lejonet', 'Tigern', 'Kaninen', 'Kapybaran', 'Katten', 'Pandan', 'Koalan']
  }
};
const animalIds = ['fox', 'otter', 'lion', 'tiger', 'bunny', 'capybara', 'cat', 'panda', 'koala'];
const fixtures = [
  [42, 58, 442, '23:25', '07:15', 94, 6240, 32],
  [46, 56, 465, '23:05', '07:15', 95, 7810, 41],
  [38, 61, 418, '23:50', '07:20', 93, 5120, 24],
  [49, 55, 480, '22:55', '07:20', 95, 8430, 48],
  [44, 57, 450, '23:20', '07:20', 94, 6980, 36],
  [52, 54, 474, '23:00', '07:20', 95, 7650, 43],
  [51, 54, 488, '22:50', '07:18', 96, 8120, 45]
];
function sampleNights() {
  return fixtures.map(([hrvRmssdMs, rhrBpm, sleepMinutes, bedtime, wake, efficiencyPct, steps, activeMinutes], i) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (7 - i));
    return {date, hrvRmssdMs, rhrBpm, sleepMinutes, bedtime, wake, efficiencyPct, steps, activeMinutes};
  });
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
function render() {
  const lang = document.getElementById('language')?.value || document.documentElement.lang;
  const t = copy[lang] || copy.en;
  document.querySelector('nav [data-view="night"] span').textContent = t.nav;
  if (location.hash !== '#night') return;
  document.getElementById('section-kicker').textContent = t.kicker;
  document.getElementById('page-title').textContent = t.title;
  let animal = 'bunny';
  try { animal = JSON.parse(localStorage.getItem('mond-profile'))?.animal || animal; } catch {}
  animal = document.documentElement.dataset.animal || animal;
  const name = t.animals[Math.max(0, animalIds.indexOf(animal) < 0 ? 4 : animalIds.indexOf(animal))];
  const nights = sampleNights(), last = nights[6];
  const number = n => n.toLocaleString(lang in copy ? lang : 'en');
  const date = d => d.toLocaleDateString(lang in copy ? lang : 'en', {month:'short', day:'numeric'});
  const duration = n => lang === 'zh-CN' ? `${Math.floor(n / 60)}${t.hours}${n % 60}${t.minutes}` : `${Math.floor(n / 60)}${t.hours} ${n % 60}${t.minutes}`;
  const metrics = [
    ['hrvRmssdMs', t.hrv, number(last.hrvRmssdMs), t.ms, 'RMSSD', 2],
    ['rhrBpm', t.rhr, number(last.rhrBpm), t.bpm, t.last, 1],
    ['sleepMinutes', t.sleep, duration(last.sleepMinutes), '', `${last.bedtime}–${last.wake} · ${last.efficiencyPct}% ${t.efficiency}`, 15],
    ['steps', t.activity, number(last.steps), t.steps, `${last.activeMinutes} ${t.active}`, 500]
  ];
  const cards = metrics.map(([key, label, value, unit, detail, threshold]) => {
    const values = nights.map(n => n[key]);
    const previous = values.slice(0, 6).sort((a,b) => a-b);
    const delta = values[6] - (previous[2] + previous[3]) / 2;
    const phrase = Math.abs(delta) <= threshold ? t.close : delta > 0 ? t.above : t.below;
    const min = Math.min(...values), range = Math.max(...values) - min || 1;
    const points = values.map((v,i) => [8 + i * 24, 40 - (v-min)/range*28]);
    const line = points.map(p => p.join(',')).join(' ');
    // The accessible description includes every illustrated value in date order.
    const description = `${t.trend.replace('{label}', label)}. ${nights.map((n,i) => `${date(n.date)}: ${key === 'sleepMinutes' ? duration(values[i]) : number(values[i])}${unit ? ' '+unit : ''}`).join('; ')}`;
    const long = String(value).length > 6 ? " long" : "";
    return `<article class="card night-metric"><h2 class="night-label">${escape(label)}</h2><p class="night-value${long}">${escape(value)} <small>${escape(unit)}</small></p><p class="night-detail">${escape(detail)}</p><p class="night-delta">${escape(phrase)}</p><svg class="night-trend" viewBox="0 0 160 52" role="img" aria-label="${escape(description)}"><polygon points="8,48 ${line} 152,48" fill="currentColor" opacity=".08"/><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>${points.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="${i===6?3.5:2}" fill="currentColor"/>`).join('')}</svg><div class="night-range"><span>${escape(date(nights[0].date))}</span><span>${escape(date(last.date))}</span></div></article>`;
  }).join('');
  document.getElementById('night-view').innerHTML = `<div class="night-intro"><span class="pill demo">${escape(t.sample)}</span><p>${escape(t.intro)}</p></div><p class="eyebrow">${escape(t.last)} · ${escape(date(last.date))}</p><div class="night-grid">${cards}</div><p class="night-baseline">${escape(t.baseline)}</p><article class="card night-message"><span class="tiny-label">${escape(t.from.replace('{name}', name))}</span><h2>${escape(t.message)}</h2><p>${escape(t.note)}</p></article><p class="science-note">${escape(t.disclaimer)}</p>`;
}
// Run after the existing router/localizer, including its synchronous event work.
const refresh = () => queueMicrotask(render);
window.addEventListener('hashchange', refresh);
window.addEventListener('mond-language-change', refresh);
document.getElementById('language')?.addEventListener('change', refresh);
window.addEventListener('storage', refresh);
refresh();
