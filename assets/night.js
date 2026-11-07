import {good} from './engine/baselines.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {loadNights,loadLogs,loadProfile,mergeLogsIntoNights} from './engine/store.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
import {generateSampleNights, runCAS} from './engine/index.js?v=4b8813b91065c7b605aa33228f88d0f3a05151a5';
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
// Keep the preview current without changing the engine's reproducible defaults.
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const endDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

const contributorLabels = {
  en: {sleepAgent:'Sleep', activityLoadAgent:'Activity', circadianSeasonAgent:'Timing', behaviorEventAgent:'Logged event'},
  'zh-CN': {sleepAgent:'睡眠', activityLoadAgent:'活动', circadianSeasonAgent:'时间', behaviorEventAgent:'已记录事件'},
  sv: {sleepAgent:'Sömn', activityLoadAgent:'Aktivitet', circadianSeasonAgent:'Tidpunkt', behaviorEventAgent:'Loggad händelse'}
};
const extra = {
 en: {tonight:"Tonight's forecast",sure:'How sure',levels:{low:'Low',medium:'Medium',high:'High'},reading:'A quiet reading',none:'No suggestion today',compare:'How the model compares',test:'Sample-data backtest · mean absolute error',models:['CAS','Last value','Personal average','AR(1)','Without HRV history'],coverage:'Interval coverage',band:'Illustrative 95% interval',open:'Visit my nights →',message:'A little glimpse of tonight, with room for uncertainty.',baseline:'Lines show the last seven available good-quality nights. Dashed ends and shaded bands illustrate tonight’s forecast. Comparisons use the median of the previous six available nights.',disclaimer:'Forecasts are a research-preview illustration on example data, not a measure of sleep quality, recovery, stress, or health, and not medical advice. No overnight sensor recording is implemented.'},
 'zh-CN':{tonight:'今晚预测',sure:'把握程度',levels:{low:'低',medium:'中',high:'高'},reading:'判断',none:'今天不做建议',compare:'模型对比',test:'示例数据回测 · 平均绝对误差',models:['CAS','最近值','个人平均值','AR(1)','不使用 HRV 历史'],coverage:'区间覆盖率',band:'示意 95% 区间',open:'查看我的夜晚 →',message:'轻轻看一眼今晚，也给不确定留些空间。',baseline:'曲线展示最近七个可用且质量良好的夜晚。虚线与阴影表示今晚的预测；比较使用此前六个可用夜晚的中位数。',disclaimer:'预测仅为示例数据上的研究预览，不衡量睡眠质量、恢复、压力或健康状况，也不是医疗建议。尚未实现传感器整夜记录。'},
 sv:{tonight:'Nattens prognos',sure:'Hur säkert',levels:{low:'Låg',medium:'Medel',high:'Hög'},reading:'En stilla läsning',none:'Inget förslag idag',compare:'Modelljämförelse',test:'Test på exempeldata · genomsnittligt absolut fel',models:['CAS','Senaste värde','Personligt snitt','AR(1)','Utan HRV-historik'],coverage:'Intervalltäckning',band:'Illustrativt 95 % intervall',open:'Se mina nätter →',message:'En liten glimt av natten, med plats för osäkerhet.',baseline:'Linjerna visar de sju senaste tillgängliga nätterna med god datakvalitet. Streckade slut och skuggade band visar nattens prognos. Jämförelser använder medianen av de sex föregående tillgängliga nätterna.',disclaimer:'Prognoserna är en forskningsillustration med exempeldata, inget mått på sömnkvalitet, återhämtning, stress eller hälsa och inga medicinska råd. Ingen sensor spelar in under natten.'}
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
function render() {
  const imported=loadNights();
  const nights=mergeLogsIntoNights(imported || generateSampleNights({endDate}),loadLogs());
  const lang = document.getElementById('language')?.value || document.documentElement.lang;
  const t = {...(copy[lang] || copy.en)};
  if(imported){t.sample=lang==='zh-CN'?'已导入数据':lang==='sv'?'Importerade data':'Imported data';t.intro=t.sample;t.baseline=t.sample;}
  // Night is nested in rhythm; older HTML may still provide a dedicated button.
  const nightNav=document.querySelector('nav [data-view="night"] span');
  if(nightNav)nightNav.textContent = t.nav;
  const x = {...(extra[lang] || extra.en)};
  if(imported){x.test=lang==='zh-CN'?'导入数据回测 · 平均绝对误差':lang==='sv'?'Test på importerade data · genomsnittligt absolut fel':'Imported-data backtest · mean absolute error';x.disclaimer=lang==='zh-CN'?'导入数据的研究预览预测，未经临床验证，不是医疗建议。仅可比的 sample-ppg 整夜 RMSSD 进入预测。':lang==='sv'?'Forskningsprognos på importerade data, inte kliniskt validerad eller medicinska råd. Endast jämförbar nattlig RMSSD från sample-ppg används.':'Research-preview forecasts on imported data, not clinically validated or medical advice. Only comparable sample-ppg overnight RMSSD informs forecasts.';}
  const result = runCAS(nights, {language: lang,profile:loadProfile()});
  if(imported){
    const replaceSource=text=>text.replaceAll('sample forecast','preview forecast').replaceAll('this sample','this preview').replaceAll('sample pattern','preview pattern').replaceAll('示例预测','预览预测').replaceAll('示例模式','预览模式').replaceAll('为示例','为预览').replaceAll('Exempelprognosen','Förhandsprognosen').replaceAll('exemplet','förhandsvisningen').replaceAll('exempelmönster','illustrativt mönster');
    result.judgment.trend=replaceSource(result.judgment.trend);result.judgment.contributors.forEach(c=>c.text=replaceSource(c.text));
    for(const key of ['above','below','close','trend'])t[key]=t[key].replaceAll('sample nights','imported nights').replaceAll('示例夜晚','导入夜晚').replaceAll('exempelnätter','importerade nätter');
  }
  const f = result.forecast;
  const fmt = n => Math.round(n).toLocaleString(lang in copy ? lang : 'en');
  const duration = n => {
    const minutes = Math.round(n);
    return lang === 'zh-CN' ? `${Math.floor(minutes / 60)}${t.hours}${minutes % 60}${t.minutes}` : `${Math.floor(minutes / 60)}${t.hours} ${minutes % 60}${t.minutes}`;
  };
  const unit = k => k === 'sleepMinutes' ? '' : k === 'hrvRmssdMs' ? t.ms : k === 'rhrBpm' ? t.bpm : t.steps;
  const value = (k, n) => Number.isFinite(n) ? (k === 'sleepMinutes' ? duration(n) : fmt(n)) : '—';
  const valueForForecast = (k, n) => `${value(k, n)} ${unit(k)}`.trim();
  const interval = k => `<span class="forecast-number">${escape(value(k, f[k].mean))} <span class="forecast-unit">${escape(unit(k))}</span></span><small class="forecast-band">${escape(value(k, f[k].lo))}–${escape(value(k, f[k].hi))}</small>`;
  const confidence = `${x.sure}: ${x.levels[result.confidence]}`;
  const confidenceDots = `<span class="confidence-dots" aria-hidden="true">${'●'.repeat({low:1,medium:2,high:3}[result.confidence])}${'○'.repeat(3-{low:1,medium:2,high:3}[result.confidence])}</span>`;
  document.getElementById('home-night-teaser').innerHTML = `<article class="card night-teaser"><span class="tiny-label">☾ ${escape(x.tonight)} · ${escape(t.sample)}</span><h2>${escape(t.hrv)} · RMSSD</h2><p class="teaser-forecast">${interval('hrvRmssdMs')}</p><p class="night-confidence">${confidenceDots} ${escape(confidence)}</p><p class="teaser-note">${escape(result.judgment.trend)}</p><a class="text-button" href="#night">${escape(x.open)}</a></article>`;
  if (!['#night','#night-view','#nights','#rhythm','#rhythm-view','#live'].includes(location.hash)) return;
  document.getElementById('section-kicker').textContent = t.kicker;
  document.getElementById('page-title').textContent = t.title;
  let animal = 'bunny';
  try { animal = JSON.parse(localStorage.getItem('mond-profile'))?.animal || animal; } catch {}
  animal = document.documentElement.dataset.animal || animal;
  const name = t.animals[Math.max(0, animalIds.indexOf(animal) < 0 ? 4 : animalIds.indexOf(animal))];
  const last = nights.findLast(n => good(n) && ['hrvRmssdMs', 'rhrBpm', 'sleepMinutes', 'steps'].some(k => Number.isFinite(n[k])));
  const number = fmt;
  const date = d => new Date(`${d}T12:00:00Z`).toLocaleDateString(lang in copy ? lang : 'en', {month:'short', day:'numeric'});
  const metrics = [
    ['hrvRmssdMs', t.hrv, t.ms, 2],
    ['rhrBpm', t.rhr, t.bpm, 1],
    ['sleepMinutes', t.sleep, '', 15],
    ['steps', t.activity, t.steps, 500]
  ];
  const cards = metrics.map(([key, label, unit, threshold]) => {
    const history = nights.filter(n => good(n) && Number.isFinite(n[key])).slice(-7);
    const latest = history.at(-1);
    const value = latest ? (key === 'sleepMinutes' ? duration(latest[key]) : number(latest[key])) : '—';
    const detail = !latest ? '—' : key === 'hrvRmssdMs' ? 'RMSSD' : key === 'sleepMinutes' ? `${latest.bedtime??'—'}–${latest.wake??'—'} · ${latest.efficiencyPct ?? '—'}% ${t.efficiency}` : key === 'steps' ? `${latest.activeMinutes ?? '—'} ${t.active}` : t.last;
    if(history.length<7) return `<article class="card night-metric"><h2 class="night-label">${escape(label)}</h2><p class="night-value">${escape(value)} <small>${escape(unit)}</small></p><p class="night-detail">${escape(detail)}</p><p class="night-delta">${escape(lang==='zh-CN'?'可比夜晚不足七晚':lang==='sv'?'Färre än sju jämförbara nätter':'Fewer than seven comparable nights')}</p></article>`;
    const values = history.map(n => n[key]);
    const previous = values.slice(0, 6).sort((a,b) => a-b);
    const delta = values[6] - (previous[2] + previous[3]) / 2;
    const phrase = Math.abs(delta) <= threshold ? t.close : delta > 0 ? t.above : t.below;
    const min = Math.min(...values, f[key].lo), range = Math.max(...values, f[key].hi) - min || 1;
    const y = v => 44 - (v-min)/range*36;
    const points = values.map((v,i) => [8 + i * 19, y(v)]);
    const line = points.map(p => p.join(',')).join(' ');
    // The accessible description includes every illustrated value in date order.
    const description = `${t.trend.replace('{label}', label)}. ${history.map((n,i) => `${date(n.date)}: ${key === 'sleepMinutes' ? duration(values[i]) : number(values[i])}${unit ? ' '+unit : ''}`).join('; ')}`;
    const forecastLabel = `${x.tonight}: ${valueForForecast(key, f[key].mean)}, ${x.band}: ${valueForForecast(key, f[key].lo)}–${valueForForecast(key, f[key].hi)}`;
    const long = String(value).length > 6 ? " long" : "";
    return `<article class="card night-metric"><h2 class="night-label">${escape(label)}</h2><p class="night-value${long}">${escape(value)} <small>${escape(unit)}</small></p><p class="night-detail">${escape(detail)}</p><p class="night-delta">${escape(phrase)}</p><svg class="night-trend" viewBox="0 0 160 52" role="img" aria-label="${escape(description + '. ' + forecastLabel)}"><polygon points="8,48 ${line} 152,48" fill="currentColor" opacity=".08"/><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polygon points="122,${y(values[6])} 150,${y(f[key].lo)} 150,${y(f[key].hi)}" fill="currentColor" opacity=".14"/><path d="M122 ${y(values[6])} L150 ${y(f[key].mean)}" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><path d="M150 ${y(f[key].lo)} V${y(f[key].hi)}" stroke="currentColor"/><circle cx="150" cy="${y(f[key].mean)}" r="3" fill="currentColor"/>${points.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="${i===6?3.5:2}" fill="currentColor"/>`).join('')}</svg><div class="night-range"><span>${escape(date(history[0].date))}</span><span>${escape(x.tonight)}</span></div></article>`;
  }).join('');
  const forecastCards = metrics.map(([key,label]) => `<article class="card forecast-card ${key === 'sleepMinutes' || key === 'steps' ? 'forecast-secondary' : 'forecast-primary'}"><h3>${escape(label)}${key === 'hrvRmssdMs' ? ' · RMSSD' : ''}</h3><p>${interval(key)}</p><small>${x.band}</small></article>`).join('');
  const models = Object.entries(result.backtest.models).map(([key,m],i) => `<tr><th scope="row">${x.models[i]}</th><td>${(m.hrvMae?.toFixed(2)??'—')}</td><td>${(m.rhrMae?.toFixed(2)??'—')}</td></tr>`).join('');
  const labels = contributorLabels[lang] || contributorLabels.en;
  const contributors = result.judgment.contributors.filter(c => c.direction !== 'neutral' && labels[c.agent]);
  const quality = result.judgment.contributors.find(c => c.agent === 'observationQualityAgent');
  const additions = `<section class="night-forecast"><h2>${x.tonight}</h2><p class="night-confidence" aria-label="${confidence}">${confidenceDots} ${confidence}</p><div class="night-grid">${forecastCards}</div></section><section class="night-judgment"><h2>${x.reading}</h2><article class="card"><p>${escape(result.judgment.trend)}</p>${result.abstain ? `<p class="night-abstain"><strong>${escape(x.none)}</strong></p>` : ''}${contributors.length ? `<div class="night-contributors">${contributors.map(c => `<div class="night-contributor"><span class="tiny-label">${escape(labels[c.agent])}</span><p>${escape(c.text)}</p></div>`).join('')}</div>` : ''}${quality ? `<p class="night-method">${escape(quality.text)}</p>` : ''}</article></section><details class="card night-comparison"><summary>${x.compare}</summary><p>${x.test} · n=${result.backtest.n}</p><table><thead><tr><th scope="col">${x.compare}</th><th scope="col">HRV (${t.ms})</th><th scope="col">RHR (${t.bpm})</th></tr></thead><tbody>${models}</tbody></table><p>${x.coverage} · HRV ${result.backtest.models.cas.hrvCoverage===null?'—':Math.round(result.backtest.models.cas.hrvCoverage*100)+'%'} · RHR ${result.backtest.models.cas.rhrCoverage===null?'—':Math.round(result.backtest.models.cas.rhrCoverage*100)+'%'}</p></details>`;
  document.getElementById('night-view').innerHTML = `<div class="night-intro"><span class="pill demo">${escape(t.sample)}</span><p>${escape(t.intro)}</p></div><p class="eyebrow">${escape(t.last)} · ${escape(last?date(last.date):'—')}</p><div class="night-grid">${cards}</div><p class="night-baseline">${escape(x.baseline)}</p>${additions}<article class="card night-message"><span class="tiny-label">${escape(t.from.replace('{name}', name))}</span><h2>${escape(x.message)}</h2><p>${escape(t.note)}</p></article><p class="science-note">${escape(x.disclaimer)}</p>`;
}
// Run after the existing router/localizer, including its synchronous event work.
const refresh = () => queueMicrotask(render);
window.addEventListener('hashchange', refresh);
window.addEventListener('mond-language-change', refresh);
document.getElementById('language')?.addEventListener('change', refresh);
window.addEventListener('storage', refresh);
window.addEventListener('mond-data-change', refresh);
refresh();
