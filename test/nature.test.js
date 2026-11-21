import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLACES_KEY, ambientAdapter, bindLocation, gasState, gases, hrvContext, placeStore, straightLine } from '../assets/engine/nature/model.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import { createMap, project, TileConsent, unproject } from '../assets/engine/nature/map.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import { word } from '../assets/engine/nature/words.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import { SENSOR_FREE_VIEWS, viewForHash } from '../assets/engine/routes.js?v=1f0587cd52bd4816df34e82a3707d09ebcbd834c';
import fixture from '../assets/data/gothenburg-nature.json' with { type: 'json' };

class Button extends EventTarget {
  disabled = false;
  click() {
    if (!this.disabled) this.dispatchEvent(new Event('click'));
  }
}

test('initialization makes zero position requests; explicit click requests one fix', () => {
  const button = new Button();
  const reports = [];
  const fixes = [];
  let attempts = 0, finish;
  bindLocation(button, { getCurrentPosition(success, failure, options) {
    attempts++;
    finish = success;
    assert.deepEqual(options, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
  } }, status => reports.push(status), fix => fixes.push(fix));
  assert.equal(attempts, 0);
  button.click();
  button.click();
  assert.equal(attempts, 1);
  finish({ coords: { latitude: 57.7, longitude: 11.9 } });
  assert.deepEqual(fixes, [{ lat: 57.7, lon: 11.9 }]);
  assert.deepEqual(reports, ['locating']);
  assert.equal(button.disabled, false);
});

test('denial, timeout, device failure and absent geolocation are reported', () => {
  for (const [code, status] of [[1, 'denied'], [2, 'unavailable'], [3, 'timeout'], [null, 'unavailable']]) {
    const button = new Button();
    const reports = [];
    const geo = code && { getCurrentPosition(success, failure) { failure({ code }); } };
    bindLocation(button, geo, value => reports.push(value), () => assert.fail('No position expected'));
    assert.deepEqual(reports, []);
    button.click();
    assert.equal(reports.at(-1), status);
    assert.equal(button.disabled, false);
  }
});

test('markers persist through reinitialization; confirmation guards deletion and scoped clear', () => {
  const values = new Map([['mond-profile', 'private']]);
  const storage = {
    getItem: key => values.get(key), setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  let approved = false, id = 0;
  const prompts = [];
  const reopen = () => placeStore(storage, prompt => { prompts.push(prompt); return approved; }, () => String(++id));
  const input = { name: '   Pond  ', kind: 'water', note: '', lat: 57.7, lon: 11.9 };
  const first = reopen().save(input);
  const second = reopen().save({ ...input, name: 'Park', kind: 'park' });
  const edited = reopen().save({ ...first, note: 'A place for tea' });
  assert.deepEqual(reopen().list(), [edited, second]);
  assert.equal(edited.name, 'Pond');
  assert.equal(reopen().remove(first.id, 'Delete Pond?'), false);
  assert.equal(reopen().clear('Clear nature places?'), false);
  assert.equal(reopen().list().length, 2);
  approved = true;
  assert.equal(reopen().remove(first.id, 'Delete Pond?'), true);
  assert.deepEqual(reopen().list(), [second]);
  assert.equal(reopen().clear('Clear nature places?'), true);
  assert.equal(values.has(PLACES_KEY), false);
  assert.deepEqual([...values], [['mond-profile', 'private']]);
  assert.deepEqual(prompts, ['Delete Pond?', 'Clear nature places?', 'Delete Pond?', 'Clear nature places?']);
});

test('external tiles have no URL without opt-in and a failed tile restores offline mode', () => {
  let failed = 0;
  const consent = new TileConsent(() => failed++);
  assert.equal(consent.url(12, 10, 20), null);
  consent.toggle();
  assert.equal(consent.url(12, 10, 20), 'https://tile.openstreetmap.org/12/10/20.png');
  consent.fail();
  consent.fail();
  assert.equal(failed, 1);
  assert.equal(consent.url(12, 10, 20), null);
  assert.match(word('tileFailed', 'en'), /local map and place list/);
  consent.toggle();
  consent.revoke();
  assert.equal(consent.url(12, 10, 20), null);
});

test('tile image error removes tiles while retaining local pins', t => {
  function node() {
    const item = new EventTarget();
    item.children = [];
    item.style = {};
    item.dataset = {};
    item.append = child => item.children.push(child);
    item.replaceChildren = () => { item.children.length = 0; };
    item.contains = child => item.children.includes(child);
    return item;
  }
  const layer = node(), pins = node(), host = node();
  Object.assign(host, { clientWidth: 390, clientHeight: 240, querySelector: selector => selector === '.nature-tiles' ? layer : pins });
  const previousDocument = globalThis.document, previousObserver = globalThis.ResizeObserver;
  globalThis.document = { createElement: node };
  globalThis.ResizeObserver = class { observe() {} };
  t.after(() => {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousObserver === undefined) delete globalThis.ResizeObserver;
    else globalThis.ResizeObserver = previousObserver;
  });
  const consent = new TileConsent(() => map.draw());
  const map = createMap(host, consent, () => {});
  map.center(fixture.origin);
  map.points([{ ...fixture.origin, kind: 'origin', name: 'Demo', label: '◎' }]);
  assert.equal(layer.children.length, 0);
  assert.equal(pins.children.length, 1);
  consent.toggle();
  map.draw();
  assert.ok(layer.children.length > 0);
  layer.children[0].dispatchEvent(new Event('error'));
  assert.equal(layer.children.length, 0);
  assert.equal(pins.children.length, 1);
});

test('Gothenburg is a sourced demonstration with an explicitly distinct user-location label', () => {
  assert.match(word('demo', 'en'), /Gothenburg \(demonstration, not your location\)/);
  assert.match(word('actual', 'en'), /Your device location/);
  assert.match(word('fixture', 'en'), /unverified/);
  assert.equal(word('title', 'zh-CN'), '身边的自然');
  assert.equal(word('title', 'sv'), 'Närnatur');
  assert.ok(fixture.places.some(place => place.kind === 'water'));
  assert.ok(fixture.places.some(place => place.kind === 'park'));
  for (const place of fixture.places) {
    assert.match(place.osm, /^(way|node|relation)\/\d+$/);
    assert.match(place.source, /^https:\/\//);
  }
  const point = unproject(project(fixture.origin, 12), 12);
  assert.ok(straightLine(point, fixture.origin) < 0.00001);
  assert.ok(Math.abs(straightLine({ lat: 0, lon: 0 }, { lat: 1, lon: 0 }) - 111.195) < 0.01);
  assert.match(word('straight', 'en'), /straight-line/);
});

test('each gas reports separate units and disconnected, stale and simulated states', async () => {
  assert.deepEqual(await ambientAdapter.read(), {});
  for (const [key, unit] of Object.entries(gases)) {
    assert.deepEqual(gasState(key), { unit, status: 'disconnected', source: null, freshness: 'noReading' });
    const old = { value: 10, source: 'test adapter', observedAt: 0 };
    assert.equal(gasState(key, old, 61000).status, 'stale');
    const simulated = gasState(key, { ...old, simulated: true }, 61000);
    assert.equal(simulated.status, 'simulated');
    assert.equal(simulated.freshness, 'stale');
    assert.equal(simulated.unit, unit);
  }
  assert.equal(gases.co2, 'ppm');
  assert.equal(gases.formaldehyde, 'µg/m³');
  assert.equal(hrvContext(), 'unknown');
});

test('MOND retains all destinations with a responsive nature grid and six mobile nav cells', () => {
  const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
  const html = read('index.html'), css = read('assets/nature.css');
  assert.ok(SENSOR_FREE_VIEWS.includes('nature'));
  assert.equal(viewForHash('#nature', null), 'nature');
  for (const view of ['home', 'rhythm', 'tools', 'journal', 'settings', 'nature']) {
    assert.match(html, new RegExp('<button data-view="' + view + '"'));
  }
  assert.match(html, /href="#nature"/);
  assert.match(html, /id="nature-view" class="view"/);
  assert.match(css, /\.nature-grid \{[^}]+grid-template-columns: minmax\(0, 1\.55fr\) minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 880px\)\s*\{\s*\.nature-grid \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 740px\)\s*\{\s*\.sidebar nav \{ grid-template-columns: repeat\(6,/);
});
