const TILE_SIZE = 256;
const tileOrigin = 'https://tile.openstreetmap.org';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const worldSize = zoom => TILE_SIZE * 2 ** zoom;

export function project({ lat, lon }, zoom) {
  const size = worldSize(zoom);
  const latitude = clamp(lat, -85.05112878, 85.05112878) * Math.PI / 180;
  return { x: (lon + 180) / 360 * size, y: (1 - Math.asinh(Math.tan(latitude)) / Math.PI) / 2 * size };
}
export function unproject({ x, y }, zoom) {
  const size = worldSize(zoom);
  return {
    lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * clamp(y, 0, size) / size))) * 180 / Math.PI,
    lon: ((x / size % 1 + 1) % 1) * 360 - 180
  };
}

export class TileConsent {
  enabled = false;
  constructor(onError) { this.onError = onError; }
  toggle() { this.enabled = !this.enabled; }
  revoke() { this.enabled = false; }
  url(z, x, y) {
    const side = 2 ** z;
    if (!this.enabled || y < 0 || y >= side) return null;
    return tileOrigin + '/' + z + '/' + ((x % side + side) % side) + '/' + y + '.png';
  }
  fail() {
    if (this.enabled) {
      this.revoke();
      this.onError();
    }
  }
}

export function createMap(host, tiles, onPick) {
  const layer = host.querySelector('.nature-tiles');
  const pins = host.querySelector('.nature-pins');
  let center, points = [], zoom = 12;
  function topLeft() {
    const p = project(center, zoom);
    return { x: p.x - host.clientWidth / 2, y: p.y - host.clientHeight / 2 };
  }
  function draw() {
    layer.replaceChildren();
    pins.replaceChildren();
    if (!center || !host.clientWidth) return;
    const corner = topLeft();
    if (tiles.enabled) {
      const right = Math.floor((corner.x + host.clientWidth) / TILE_SIZE);
      const bottom = Math.floor((corner.y + host.clientHeight) / TILE_SIZE);
      for (let x = Math.floor(corner.x / TILE_SIZE); x <= right; x++) {
        for (let y = Math.floor(corner.y / TILE_SIZE); y <= bottom; y++) {
          const url = tiles.url(zoom, x, y);
          if (!url) continue;
          const tile = document.createElement('img');
          tile.alt = '';
          tile.style.left = x * TILE_SIZE - corner.x + 'px';
          tile.style.top = y * TILE_SIZE - corner.y + 'px';
          tile.addEventListener('error', () => { if (layer.contains(tile)) tiles.fail(); });
          tile.src = url;
          layer.append(tile);
        }
      }
    }
    for (const point of points) {
      const p = project(point, zoom);
      const x = ((p.x - corner.x + worldSize(zoom) / 2) % worldSize(zoom) + worldSize(zoom)) % worldSize(zoom) - worldSize(zoom) / 2;
      const y = p.y - corner.y;
      if (x < 0 || x > host.clientWidth || y < 0 || y > host.clientHeight) continue;
      const pin = document.createElement('span');
      pin.className = 'nature-pin';
      pin.dataset.kind = point.kind;
      pin.style.left = x + 'px';
      pin.style.top = y + 'px';
      pin.textContent = point.label;
      pin.title = point.name;
      pins.append(pin);
    }
  }
  function pick(x, y) {
    const corner = topLeft();
    onPick(unproject({ x: corner.x + x, y: corner.y + y }, zoom));
  }
  host.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    const rect = host.getBoundingClientRect();
    pick(event.clientX - rect.left - host.clientLeft, event.clientY - rect.top - host.clientTop);
  });
  new ResizeObserver(draw).observe(host);
  return {
    draw,
    points(values) { points = values; draw(); },
    center(point) { center = point; zoom = 12; draw(); },
    zoom(delta) { zoom = clamp(zoom + delta, 3, 18); draw(); },
    pan(dx, dy) {
      const p = project(center, zoom);
      center = unproject({ x: p.x + dx, y: p.y + dy }, zoom);
      draw();
    }
  };
}
