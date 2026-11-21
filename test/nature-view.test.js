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

test('the nature module opens in demo mode, gates device and tiles, and discards in-flight fixes on exit', async t => {
  const elements = new Map();
  const node = selector => {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  };
  const host = node('#nature-view'), home = node('#home-view'), nav = node('nav [data-view="nature"]');
  const language = node('#language'), form = node('#nature-place-form');
  language.value = 'en';
  form.elements = Object.fromEntries(['name', 'kind', 'lat', 'lon', 'note'].map(key => [key, new Element()]));
  form.elements.kind.options = [{ value: 'park' }];
  form.reset = () => {};
  node('#nature-tiles-toggle').append(new Element());
  node('.nature-map').querySelector = host.querySelector = node;
  host.querySelectorAll = () => [];
  host.hidden = true;
  let requested = 0, success, fail;
  const document = Object.assign(new EventTarget(), {
    querySelector: node,
    querySelectorAll: selector => selector === '.view' ? [home, host] : [],
    createElement: () => new Element()
  });
  const location = { hash: '#nature' };
  const window = new EventTarget();
  const install = {
    window, document, location,
    navigator: { geolocation: { getCurrentPosition(ok, error) { requested++; success = ok; fail = error; } } },
    ResizeObserver: class { observe() {} },
    localStorage: { getItem() { return null; } }
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
  document.dispatchEvent(new Event('DOMContentLoaded'));
  assert.equal(requested, 0);
  assert.equal(host.hidden, false);
  assert.equal(home.hidden, true);
  assert.equal(node('#page-title').textContent, 'Nearby nature');
  assert.equal(node('#nature-area').textContent, 'Gothenburg (demonstration, not your location)');
  assert.equal(node('.nature-tiles').children.length, 0);
  assert.equal(node('#nature-hrv').textContent, 'HRV context · unknown');
  assert.equal(nav.attributes.get('aria-label'), 'Nearby nature');

  node('#nature-tiles-toggle').click();
  assert.ok(node('.nature-tiles').children.length);
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
  success({ coords: { latitude: 59.3, longitude: 18.0 } });
  assert.match(node('#nature-area').textContent, /Your device location/);
  assert.equal(node('.nature-tiles').children.length, 0);
  assert.match(node('#nature-fixtures').children[0].textContent, /within 12 km/);

  node('#nature-tired').checked = true;
  node('#nature-tired').dispatchEvent(new Event('change'));
  assert.equal(node('#nature-suggestions').hidden, false);
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
  language.value = 'zh-CN';
  language.dispatchEvent(new Event('change'));
  assert.equal(node('#page-title').textContent, '身边的自然');
});
