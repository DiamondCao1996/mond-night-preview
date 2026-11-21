import fixture from './data/gothenburg-nature.json' with { type: 'json' };
import { PLACES_KEY, bindLocation, categories, gasState, gases, hrvContext, placeStore, straightLine, validPoint } from './engine/nature/model.js?v=668c190afb0d0074eb411e3a30d184f0a3f42443';
import { approximateLocation } from './engine/nature/ip.js?v=668c190afb0d0074eb411e3a30d184f0a3f42443';
import { createMap, TileConsent } from './engine/nature/map.js?v=668c190afb0d0074eb411e3a30d184f0a3f42443';
import { word } from './engine/nature/words.js?v=668c190afb0d0074eb411e3a30d184f0a3f42443';
import { revealView } from './engine/routes.js?v=668c190afb0d0074eb411e3a30d184f0a3f42443';

const host = document.querySelector('#nature-view');
host.setAttribute('translate', 'no');
const language = document.querySelector('#language');
const t = key => word(key, language.value);
const $ = selector => host.querySelector(selector);
const store = placeStore({
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key)
}, message => window.confirm(message));
const label = key => '<span data-nature-text="' + key + '"></span>';
const button = (id, key, attrs = '') => '<button type="button" class="outline" id="' + id + '" ' + attrs + '>' + label(key) + '</button>';

host.innerHTML = `
  <p class="nature-intro">${label('intro')}</p>
  <div class="nature-grid">
    <section class="card nature-map-card" aria-labelledby="nature-map-title">
      <h2 id="nature-map-title">${label('map')}</h2>
      <p class="nature-area" id="nature-area"></p>
      <p id="nature-gps-info">${label('gpsInfo')}</p>
      <div class="nature-actions">
        ${button('nature-locate', 'gps', 'aria-describedby="nature-gps-info"')}
        ${button('nature-demo', 'reset')}
      </div>
      <p id="nature-ip-info">${label('ipInfo')}</p>
      ${button('nature-ip', 'ipButton', 'aria-describedby="nature-ip-info"')}
      <p id="nature-manual-info" class="small">${label('manualInfo')}</p>
      <form id="nature-area-form" aria-describedby="nature-manual-info">
        <div class="nature-fields">
          <label>${label('lat')}<input type="number" inputmode="decimal" step="any" name="lat"></label>
          <label>${label('lon')}<input type="number" inputmode="decimal" step="any" name="lon"></label>
        </div>
        <button type="submit" class="outline">${label('manualButton')}</button>
      </form>
      <p role="status" id="nature-manual-error"></p>
      <p role="status" id="nature-position-status"></p>
      <div class="nature-map">
        <div class="nature-tiles" aria-hidden="true"></div>
        <div class="nature-pins" aria-hidden="true"></div>
        <span class="nature-north" aria-hidden="true">↑ N</span>
        <a class="nature-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors · ODbL</a>
      </div>
      <div class="nature-actions nature-map-controls"></div>
      <p class="small">${label('mapHelp')}</p>
      <p class="small" id="nature-map-status" role="status"></p>
      <p class="small" id="nature-tile-info">${label('tilesInfo')}</p>
      ${button('nature-tiles-toggle', 'tilesOn', 'aria-describedby="nature-tile-info" aria-pressed="false"')}
      <p class="small" id="nature-fixture-info">${label('fixture')}</p>
      <ol id="nature-fixtures" class="nature-list"></ol>
    </section>
    <div class="nature-stack">
      <section class="card">
        <h2>${label('low')}</h2>
        <p>${label('lowIntro')}</p>
        <label class="nature-check"><input id="nature-tired" type="checkbox"> ${label('lowToggle')}</label>
        <p class="small" id="nature-hrv"></p>
        <div id="nature-suggestions" hidden><h3>${label('suggestions')}</h3><ul class="nature-list" id="nature-suggestion-list"></ul></div>
      </section>
      <section class="card">
        <h2>${label('air')}</h2>
        <p>${label('airInfo')}</p>
        <label class="nature-check"><input id="nature-simulation" type="checkbox"> ${label('simulate')}</label>
        <dl id="nature-gases"></dl>
      </section>
    </div>
    <section class="card nature-places">
      <h2>${label('personal')}</h2>
      <form id="nature-place-form">
        <p id="nature-editing" hidden>${label('editing')}</p>
        <div class="nature-fields">
          <label>${label('name')}<input required maxlength="80" name="name"></label>
          <label>${label('kind')}<select name="kind">${categories.map(key => '<option value="' + key + '"></option>').join('')}</select></label>
          <label>${label('lat')}<input required type="number" inputmode="decimal" min="-90" max="90" step="any" name="lat"></label>
          <label>${label('lon')}<input required type="number" inputmode="decimal" min="-180" max="180" step="any" name="lon"></label>
          <label class="nature-note">${label('note')}<textarea name="note" rows="2" maxlength="300"></textarea></label>
        </div>
        <div class="nature-actions">
          <button class="primary">${label('save')}</button>
          ${button('nature-edit-cancel', 'cancel', 'hidden')}
        </div>
      </form>
      <p role="status" id="nature-place-status"></p>
      <ul id="nature-personal-list" class="nature-list"></ul>
      ${button('nature-clear', 'clear')}
    </section>
  </div>`;

const form = $('#nature-place-form');
const fields = form.elements;
const areaForm = $('#nature-area-form');
let actual = null;
let positionStatus = '';
let placeStatus = '';
let tileFailed = false;
let editing = null;
let active = false;
let locationGeneration = 0;
let ipController;
let tilesStoppedForArea = false;
let showingPlace = false;
let manualError = false;
const inView = () => active && location.hash === '#nature';
const locating = () => positionStatus === 'locating' || positionStatus === 'ipLocating';
let simulationTime;
const origin = () => actual || fixture.origin;
const tiles = new TileConsent(() => {
  tileFailed = true;
  refreshTileStatus();
  map.draw();
});
const map = createMap($('.nature-map'), tiles, point => {
  fields.lat.value = point.lat.toFixed(5);
  fields.lon.value = point.lon.toFixed(5);
  form.scrollIntoView({ block: 'nearest' });
  fields.name.focus({ preventScroll: true });
});

const mapControls = {
  west: ['←', () => map.pan(-140, 0)], north: ['↑', () => map.pan(0, -140)],
  south: ['↓', () => map.pan(0, 140)], east: ['→', () => map.pan(140, 0)],
  zoomIn: ['+', () => map.zoom(1)], zoomOut: ['−', () => map.zoom(-1)],
  center: ['◎', () => {
    if (showingPlace) stopTiles(true);
    showingPlace = false;
    map.center(origin());
  }]
};
function action(text, handler) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'outline';
  item.textContent = text;
  item.addEventListener('click', handler);
  return item;
}
for (const [key, [glyph, run]] of Object.entries(mapControls)) {
  const control = action(glyph, run);
  control.dataset.natureControl = key;
  $('.nature-map-controls').append(control);
}

function refreshTileStatus() {
  const toggle = $('#nature-tiles-toggle');
  toggle.firstElementChild.textContent = t(tiles.enabled ? 'tilesOff' : 'tilesOn');
  toggle.setAttribute('aria-pressed', String(tiles.enabled));
  toggle.disabled = locating();
  const status = tileFailed ? 'tileFailed' : tiles.enabled ? 'online' : 'offline';
  $('#nature-map-status').textContent = t(status) + (tilesStoppedForArea ? ' · ' + t('tilesArea') : '');
}

function stopTiles(areaChanged = false) {
  tiles.revoke();
  tileFailed = false;
  tilesStoppedForArea ||= areaChanged;
  refreshTileStatus();
}

$('#nature-tiles-toggle').addEventListener('click', () => {
  if (!inView() || locating()) return;
  tiles.toggle();
  tileFailed = tilesStoppedForArea = false;
  refreshTileStatus();
  map.draw();
});

function cancelLocation() {
  locationGeneration++;
  cancelDevice();
  ipController?.abort();
  ipController = undefined;
}

function beginLocation(status) {
  cancelLocation();
  positionStatus = status;
  stopTiles(tiles.enabled);
  render();
}

function setArea(point) {
  actual = point;
  showingPlace = false;
  positionStatus = '';
  stopTiles(true);
  map.center(origin());
  render();
}

const cancelDevice = bindLocation($('#nature-locate'), () => navigator.geolocation,
  () => window.isSecureContext === true, status => {
    if (!inView()) return false;
    if (status === 'locating') beginLocation(status);
    else {
      positionStatus = status;
      render();
    }
    return true;
  }, point => {
    if (inView()) setArea(point);
  });

$('#nature-ip').addEventListener('click', async () => {
  if (!inView()) return;
  beginLocation('ipLocating');
  const request = locationGeneration;
  ipController = new AbortController();
  const { point, status } = await approximateLocation((...args) => fetch(...args), ipController);
  if (!inView() || request !== locationGeneration) return;
  ipController = undefined;
  if (point) setArea(point);
  else {
    positionStatus = status === 'aborted' ? '' : status;
    render();
  }
});

areaForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!inView()) return;
  const point = {
    lat: areaForm.elements.lat.valueAsNumber,
    lon: areaForm.elements.lon.valueAsNumber,
    source: 'manualSource'
  };
  manualError = !validPoint(point);
  if (manualError) {
    render();
    return;
  }
  cancelLocation();
  setArea(point);
});

function clearAreaForm() {
  areaForm.reset();
  manualError = false;
}

$('#nature-demo').addEventListener('click', () => {
  cancelLocation();
  clearAreaForm();
  setArea(null);
});

function edit(place, focus = false) {
  editing = place?.id || null;
  form.reset();
  $('#nature-editing').hidden = $('#nature-edit-cancel').hidden = !editing;
  if (place) {
    for (const name of ['name', 'kind', 'note', 'lat', 'lon']) fields[name].value = place[name];
  }
  if (focus) fields.name.focus();
}

function updatePlaces(operation) {
  try {
    operation();
  } catch {
    placeStatus = 'storageError';
  }
  render();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  updatePlaces(() => {
    if (window.__MOND_STORAGE_TEMP) throw new Error('Persistent storage unavailable');
    store.save({
      id: editing, name: fields.name.value, kind: fields.kind.value, note: fields.note.value,
      lat: fields.lat.valueAsNumber, lon: fields.lon.valueAsNumber
    });
    placeStatus = 'saved';
    edit(null);
  });
});

$('#nature-edit-cancel').addEventListener('click', () => edit(null));
$('#nature-clear').addEventListener('click', () => updatePlaces(() => {
  if (store.clear(t('confirmClear'))) {
    edit(null);
    placeStatus = '';
  }
}));

function placeRow(place, details) {
  const row = document.createElement('li');
  const name = document.createElement('strong');
  const extra = document.createElement('small');
  name.textContent = place.label ? place.label + ' · ' + place.name : place.name;
  extra.textContent = [t(place.kind), details].filter(Boolean).join(' · ');
  row.append(name, extra);
  return row;
}

function showOnMap(place) {
  // A private saved place can be outside the area covered by the tile consent.
  showingPlace = true;
  stopTiles(true);
  map.center(place);
  $('.nature-map').scrollIntoView({ block: 'nearest' });
}

function renderPlaces() {
  let places = [];
  try { places = store.list(); } catch { placeStatus = 'storageError'; }
  const distance = point => straightLine(origin(), point);
  const relevant = fixture.places.map((place, index) => ({ ...place, label: String(index + 1) }))
    .filter(place => !actual || distance(place) <= 12);
  const hasDemo = relevant.length > 0;
  $('#nature-fixture-info').hidden = !hasDemo;
  const personal = places.map((place, index) => ({ ...place, label: 'P' + (index + 1) }));
  const distanceText = place => new Intl.NumberFormat(language.value, { maximumFractionDigits: 1 }).format(distance(place)) + ' ' + t('straight');
  const empty = message => Object.assign(document.createElement('li'), { textContent: message });
  $('#nature-fixtures').replaceChildren(...(relevant.length ? relevant.map(place => {
    const row = placeRow(place, distanceText(place));
    row.append(action(t('show'), () => showOnMap(place)));
    return row;
  }) : [empty(t('noDirectory'))]));
  $('#nature-personal-list').replaceChildren(...(personal.length ? personal.map(place => {
    const row = placeRow(place, place.note);
    const controls = document.createElement('div');
    controls.className = 'nature-actions';
    controls.append(
      action(t('show'), () => showOnMap(place)),
      action(t('edit'), () => edit(place, true)),
      action(t('remove'), () => updatePlaces(() => {
        if (store.remove(place.id, t('confirmPlace') + '\n' + place.name)) {
          if (editing === place.id) edit(null);
          placeStatus = '';
        }
      }))
    );
    row.append(controls);
    return row;
  }) : [empty(t('noPlaces'))]));
  const suggestions = [...relevant, ...personal.filter(p => ['park', 'water'].includes(p.kind))]
    .filter(place => distance(place) <= 12)
    .sort((a, b) => distance(a) - distance(b));
  $('#nature-suggestion-list').replaceChildren(...suggestions.map(place => placeRow(place, [distanceText(place), t(place.id ? 'local' : 'fixture')].join(' · '))),
    ...(!hasDemo ? [empty(t('noDirectory'))] : []));
  const reference = { ...origin(), label: '◎', kind: 'origin', name: t(actual?.source || 'demo') };
  map.points([...relevant, ...personal, reference]);
}

function renderGases() {
  const gasesList = $('#nature-gases');
  gasesList.replaceChildren();
  for (const key of Object.keys(gases)) {
    const reading = simulationTime === undefined ? undefined : {
      source: t('example'), observedAt: simulationTime, simulated: true, value: key === 'co2' ? 450 : 12
    };
    const state = gasState(key, reading);
    const name = document.createElement('dt');
    const data = document.createElement('dd');
    name.textContent = t(key);
    data.textContent = (state.value ?? '—') + ' ' + state.unit + ' · ' + t(state.status) +
      ' · ' + t('source') + ' — ' + (state.source || t('disconnected')) +
      ' · ' + t('freshness') + ' — ' + t(state.freshness);
    gasesList.append(name, data);
  }
}

$('#nature-tired').addEventListener('change', event => { $('#nature-suggestions').hidden = !event.target.checked; });
let freshnessTimer;
function stopSimulation() {
  clearTimeout(freshnessTimer);
  simulationTime = undefined;
  $('#nature-simulation').checked = false;
}
$('#nature-simulation').addEventListener('change', event => {
  clearTimeout(freshnessTimer);
  simulationTime = event.target.checked ? Date.now() : undefined;
  if (simulationTime !== undefined) freshnessTimer = setTimeout(renderGases, 60001);
  renderGases();
});

function render() {
  document.querySelectorAll('[data-nature-text]').forEach(node => { node.textContent = t(node.dataset.natureText); });
  document.querySelector('nav [data-view="nature"]').setAttribute('aria-label', t('title'));
  for (const node of host.querySelectorAll('[data-nature-control]')) {
    const title = t(node.dataset.natureControl);
    node.title = title;
    node.setAttribute('aria-label', title);
  }
  for (const option of fields.kind.options) option.textContent = t(option.value);
  const area = [t(actual?.source || 'demo')];
  if (actual?.timestamp !== undefined) {
    area.push(new Intl.DateTimeFormat(language.value, { dateStyle: 'medium', timeStyle: 'medium' }).format(actual.timestamp));
  }
  const number = new Intl.NumberFormat(language.value, { maximumSignificantDigits: 4 });
  if (actual?.accuracy !== undefined) area.push(t('accuracy') + ' ±' + number.format(actual.accuracy) + ' ' + t('meters'));
  if (actual?.accuracyKm !== undefined) area.push(t('accuracy') + ' ±' + number.format(actual.accuracyKm) + ' ' + t('kilometers'));
  $('#nature-area').textContent = area.join(' · ');
  $('#nature-demo').hidden = !actual && !locating();
  $('#nature-manual-error').textContent = manualError ? t('manualInvalid') : '';
  $('#nature-position-status').textContent = positionStatus ? t(positionStatus) : '';
  $('#nature-hrv').textContent = hrvContext() === 'unknown' ? t('hrv') : '';
  refreshTileStatus();
  renderPlaces();
  $('#nature-place-status').textContent = placeStatus ? t(placeStatus) : '';
  renderGases();
}
function syncRoute() {
  if (location.hash === '#nature') {
    revealView(host);
    document.querySelector('#page-title').textContent = t('title');
    document.querySelector('#section-kicker').textContent = 'MOND';
    if (!active) map.center(origin());
    active = true;
  } else if (active) {
    active = false;
    cancelLocation();
    clearAreaForm();
    tilesStoppedForArea = showingPlace = false;
    stopTiles();
    actual = null;
    positionStatus = placeStatus = '';
    $('#nature-tired').checked = false;
    $('#nature-suggestions').hidden = true;
    stopSimulation();
    edit(null);
    map.center(origin());
  }
  render();
}
window.addEventListener('hashchange', syncRoute);
window.addEventListener('mond-language-change', syncRoute);
language.addEventListener('change', syncRoute);
window.addEventListener('storage', event => {
  if (active && (event.key === null || event.key === PLACES_KEY)) render();
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncRoute);
else syncRoute();
