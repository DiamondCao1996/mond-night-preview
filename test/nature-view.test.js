import test from 'node:test';
import assert from 'node:assert/strict';

class Element extends EventTarget {
  children = [];
  style = {};
  dataset = {};
  attributes = new Map();
  hidden = false;
  value = '';
  textContent = '';
  clientWidth = 390;
  clientHeight = 240;
  setAttribute(key, value) { this.attributes.set(key, value); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  contains(child) { return this.children.includes(child); }
  get firstElementChild() { return this.children[0]; }
  click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
}

test('nature view gates device, GeoJS and tiles, cancels stale fixes, and supports offline areas', async t => {
  const elements = new Map();
  const node = selector => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  const host = node('#nature-view'), home = node('#home-view'), nav = node('nav [data-view="nature"]');
  const language = node('#language'), form = node('#nature-place-form'), area = node('#nature-area-form');
  language.value = 'en';
  form.elements = Object.fromEntries(['name', 'kind', 'lat', 'lon', 'note'].map(key => [key, new Element()]));
  form.elements.kind.options = [{ value: 'park' }];
  form.reset = () => {};
  area.elements = { lat: new Element(), lon: new Element() };
  area.reset = () => {
    area.elements.lat.valueAsNumber = area.elements.lon.valueAsNumber = NaN;
  };
  node('#nature-tiles-toggle').append(new Element());
  node('.nature-map').querySelector = host.querySelector = node;
  host.querySelectorAll = () => [];
  host.hidden = true;
  let requested = 0, success, fail;
  const requests = [], tileRequests = [];
  const storage = new Map([
    ['mond-profile', 'unrelated'],
    ['mond-nature-city-places', JSON.stringify([{ id: 'fixture', name: 'My fixture park', kind: 'park', lat: 39, lon: -101 }])]
  ]);
  const document = Object.assign(new EventTarget(), {
    querySelector: node,
    querySelectorAll: selector => selector === '.view' ? [home, host] : [],
    createElement: tag => {
      const element = new Element();
      if (tag === 'img') Object.defineProperty(element, 'src', { set: url => tileRequests.push(url) });
      return element;
    }
  });
  const location = { hash: '#nature' };
  const window = Object.assign(new EventTarget(), { isSecureContext: true, confirm: () => true });
  const install = {
    window, document, location,
    navigator: { geolocation: { getCurrentPosition(ok, error) { requested++; success = ok; fail = error; } } },
    ResizeObserver: class { observe() {} },
    fetch: (url, options) => new Promise(resolve => requests.push({ url, signal: options.signal, resolve })),
    localStorage: { getItem: key => storage.get(key), removeItem: key => storage.delete(key) }
  };
  for (const [key, value] of Object.entries(install)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else delete globalThis[key];
    });
  }
  await import('../assets/nature.js?integration');
  assert.equal(requested, 0);
  assert.equal(requests.length, 0);
  document.dispatchEvent(new Event('DOMContentLoaded'));
  assert.equal(requested, 0);
  assert.equal(requests.length, 0);
  assert.equal(host.hidden, false);
  assert.equal(home.hidden, true);
  assert.equal(node('#page-title').textContent, 'Nearby nature');
  assert.equal(node('#nature-area').textContent, 'Gothenburg (demonstration, not your location)');
  assert.equal(node('.nature-tiles').children.length, 0);
  assert.equal(node('#nature-hrv').textContent, 'HRV context · unknown');
  assert.equal(nav.attributes.get('aria-label'), 'Nearby nature');

  node('#nature-tiles-toggle').click();
  assert.ok(node('.nature-tiles').children.length);
  assert.equal(requested, 0);
  assert.equal(requests.length, 0);
  node('.nature-tiles').children[0].dispatchEvent(new Event('error'));
  assert.equal(node('.nature-tiles').children.length, 0);
  assert.match(node('#nature-map-status').textContent, /still available/);
  assert.ok(node('#nature-fixtures').children.length);

  node('#nature-locate').click();
  assert.equal(requested, 1);
  fail({ code: 1 });
  assert.match(node('#nature-position-status').textContent, /denied/);
  node('#nature-tiles-toggle').click();
  node('#nature-locate').click();
  assert.equal(requested, 2);
  const tilesBeforeFix = tileRequests.length;
  const timestamp = 1700000000000;
  success({ coords: { latitude: 59.3, longitude: 18.0, accuracy: 40 }, timestamp });
  assert.match(node('#nature-area').textContent, /Your device location/);
  assert.equal(node('.nature-tiles').children.length, 0);
  assert.equal(tileRequests.length, tilesBeforeFix);
  assert.equal(requests.length, 0);
  assert.match(node('#nature-map-status').textContent, /Enable OpenStreetMap tiles/);
  assert.match(node('#nature-fixtures').children[0].textContent, /No live local place directory/);
  assert.match(node('#nature-area').textContent, /Accuracy radius ±40 m/);
  const formatted = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'medium' }).format(timestamp);
  assert.ok(node('#nature-area').textContent.includes(formatted));
  const circle = node('.nature-pins').children.find(child => child.className === 'nature-accuracy');
  assert.ok(parseFloat(circle.style.width) > 0);
  assert.equal(circle.style.width, circle.style.height);

  node('#nature-tired').checked = true;
  node('#nature-tired').dispatchEvent(new Event('change'));
  assert.equal(node('#nature-suggestions').hidden, false);
  assert.match(node('#nature-suggestion-list').children[0].textContent, /No live local place directory/);
  node('#nature-simulation').checked = true;
  node('#nature-simulation').dispatchEvent(new Event('change'));
  const gasValues = node('#nature-gases').children.filter((_, index) => index % 2);
  assert.deepEqual(gasValues.map(value => value.textContent.includes('Simulated')), [true, true]);

  node('#nature-locate').click();
  location.hash = '#home';
  window.dispatchEvent(new Event('hashchange'));
  success({ coords: { latitude: 59.4, longitude: 18.1 } });
  location.hash = '#nature';
  window.dispatchEvent(new Event('hashchange'));
  assert.match(node('#nature-area').textContent, /Gothenburg/);
  assert.equal(node('#nature-suggestions').hidden, true);
  assert.equal(node('#nature-simulation').checked, false);
  node('#nature-locate').click();
  const outdatedFix = success;
  node('#nature-demo').click();
  node('#nature-locate').click();
  outdatedFix({ coords: { latitude: 59.4, longitude: 18.1 } });
  assert.match(node('#nature-position-status').textContent, /Waiting for your device/);
  fail({ code: 3 });
  assert.match(node('#nature-position-status').textContent, /timed out/);

  const deviceAttempts = requested;
  const tilesBeforeIp = tileRequests.length;
  const geoJson = () => Response.json({ latitude: '39', longitude: '-101', accuracy: 40, ip: '192.0.2.1' });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  node('#nature-ip').click();
  assert.equal(requests.length, 1);
  assert.equal(requested, deviceAttempts);
  assert.equal(tileRequests.length, tilesBeforeIp);
  requests[0].resolve(geoJson());
  await flush();
  assert.match(node('#nature-area').textContent, /Approximate IP location \(GeoJS\).*VPN.*40 km/);
  assert.doesNotMatch(node('#nature-area').textContent, /192\.0\.2\.1/);
  assert.equal(node('.nature-pins').children.some(child => child.className === 'nature-accuracy'), false);
  assert.equal(tileRequests.length, tilesBeforeIp);

  for (const destination of ['reset', 'exit', 'new request']) {
    node('#nature-ip').click();
    const outdated = requests.at(-1);
    if (destination === 'exit') {
      location.hash = '#home';
      window.dispatchEvent(new Event('hashchange'));
      location.hash = '#nature';
      window.dispatchEvent(new Event('hashchange'));
    } else if (destination === 'new request') {
      node('#nature-ip').click();
    } else {
      node('#nature-demo').click();
    }
    assert.equal(outdated.signal.aborted, true);
    outdated.resolve(geoJson());
    await flush();
    assert.match(node('#nature-area').textContent, /Gothenburg/);
    if (destination === 'new request') assert.match(node('#nature-position-status').textContent, /Waiting for GeoJS/);
  }

  const pending = requests.at(-1);
  area.elements.lat.valueAsNumber = 91;
  area.elements.lon.valueAsNumber = -101;
  area.dispatchEvent(new Event('submit', { cancelable: true }));
  assert.match(node('#nature-manual-error').textContent, /Enter latitude/);
  // Synthetic US-range fixture used for distance filtering only.
  area.elements.lat.valueAsNumber = 39;
  area.dispatchEvent(new Event('submit', { cancelable: true }));
  assert.equal(pending.signal.aborted, true);
  pending.resolve(geoJson());
  await flush();
  assert.equal(node('#nature-area').textContent, 'Manually chosen area');
  assert.equal(node('#nature-fixture-info').hidden, true);
  assert.match(node('#nature-fixtures').children[0].textContent, /No live local place directory/);
  assert.equal(node('#nature-suggestion-list').children.length, 2);
  assert.equal(node('#nature-suggestion-list').children[0].children[0].textContent, 'P1 · My fixture park');
  assert.match(node('#nature-suggestion-list').children[1].textContent, /No live local place directory/);
  assert.deepEqual([...storage.keys()], ['mond-profile', 'mond-nature-city-places']);
  assert.equal(tileRequests.length, tilesBeforeIp);
  node('#nature-tiles-toggle').click();
  assert.ok(tileRequests.length > tilesBeforeIp);
  const tilesBeforeManual = tileRequests.length;
  area.elements.lat.valueAsNumber = 35;
  area.elements.lon.valueAsNumber = 105;
  area.dispatchEvent(new Event('submit', { cancelable: true }));
  assert.equal(tileRequests.length, tilesBeforeManual);
  assert.equal(node('#nature-tiles-toggle').attributes.get('aria-pressed'), 'false');
  assert.match(node('#nature-map-status').textContent, /Enable OpenStreetMap tiles/);
  node('#nature-clear').click();
  assert.deepEqual([...storage], [['mond-profile', 'unrelated']]);

  language.value = 'zh-CN';
  language.dispatchEvent(new Event('change'));
  assert.equal(node('#page-title').textContent, '身边的自然');
});
