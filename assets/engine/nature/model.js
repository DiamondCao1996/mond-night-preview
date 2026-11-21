export const PLACES_KEY = 'mond-nature-city-places';
export const categories = ['park', 'water', 'cafe', 'path', 'home', 'other'];
export const validPoint = ({ lat, lon }) =>
  Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180;

export function placeStore(storage, confirmAction, makeId = () => crypto.randomUUID()) {
  const list = () => {
    const saved = JSON.parse(storage.getItem(PLACES_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  };
  const write = places => storage.setItem(PLACES_KEY, JSON.stringify(places));
  return {
    list,
    save({ id, name, kind, note, lat, lon }) {
      const places = list();
      const index = places.findIndex(place => place.id === id);
      if (!name.trim() || !categories.includes(kind) || !validPoint({ lat, lon })) throw new Error('Invalid place');
      if (id && index < 0) throw new Error('Place no longer exists');
      const place = { id: id || makeId(), name: name.trim().slice(0, 80), kind, note: note.trim().slice(0, 300), lat, lon };
      if (index < 0) places.push(place);
      else places[index] = place;
      write(places);
      return place;
    },
    remove(id, message) {
      const places = list();
      if (!places.some(place => place.id === id) || !confirmAction(message)) return false;
      write(places.filter(place => place.id !== id));
      return true;
    },
    clear(message) {
      if (!confirmAction(message)) return false;
      storage.removeItem(PLACES_KEY);
      return true;
    }
  };
}

export function bindLocation(button, getGeolocation, isSecure, report, locate) {
  let generation = 0;
  const cancel = () => {
    generation++;
    button.disabled = false;
  };
  button.addEventListener('click', () => {
    if (report('locating') === false) return;
    const request = ++generation;
    button.disabled = true;
    const failure = error => {
      if (request !== generation) return;
      cancel();
      report(({ 1: 'denied', 3: 'timeout' })[error?.code] || 'unavailable');
    };
    if (!isSecure()) {
      cancel();
      report('insecure');
      return;
    }
    try {
      const geolocation = getGeolocation();
      if (typeof geolocation?.getCurrentPosition !== 'function') {
        cancel();
        report('unsupported');
        return;
      }
      geolocation.getCurrentPosition(({ coords, timestamp }) => {
        if (request !== generation) return;
        const point = { lat: coords.latitude, lon: coords.longitude, source: 'actual' };
        if (!validPoint(point)) {
          failure();
          return;
        }
        if (Number.isFinite(coords.accuracy) && coords.accuracy > 0) point.accuracy = coords.accuracy;
        if (Number.isFinite(timestamp) && Math.abs(timestamp) <= 8.64e15) point.timestamp = timestamp;
        cancel();
        locate(point);
      }, failure, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } catch {
      failure();
    }
  });
  return cancel;
}

export function straightLine(a, b) {
  const rad = Math.PI / 180;
  const hav = Math.sin((b.lat - a.lat) * rad / 2) ** 2
    + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lon - a.lon) * rad / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, hav)));
}

// The prototype has no verified personal HRV baseline integration.
export const hrvContext = () => 'unknown';
export const gases = { co2: 'ppm', formaldehyde: 'µg/m³' };

// Future adapter contract: async read() returns gas readings keyed by gases.
// Each reading supplies { value, source, observedAt } using epoch milliseconds.
// Simulations additionally set simulated: true. No transport or device protocol.
export const ambientAdapter = { async read() { return {}; } };

export function gasState(key, reading, now = Date.now()) {
  const unit = gases[key];
  if (!reading || !Number.isFinite(reading.value) || reading.value < 0 ||
      !reading.source || !Number.isFinite(reading.observedAt) || reading.observedAt > now) {
    return { unit, status: 'disconnected', source: null, freshness: 'noReading' };
  }
  const freshness = now - reading.observedAt > 60000 ? 'stale' : 'fresh';
  return { ...reading, unit, status: reading.simulated ? 'simulated' : freshness, freshness };
}
