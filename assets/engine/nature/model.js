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

export function bindLocation(button, geolocation, report, locate) {
  button.addEventListener('click', () => {
    if (!geolocation?.getCurrentPosition) {
      report('unavailable');
      return;
    }
    button.disabled = true;
    report('locating');
    const failure = error => {
      button.disabled = false;
      report(({ 1: 'denied', 3: 'timeout' })[error?.code] || 'unavailable');
    };
    try {
      geolocation.getCurrentPosition(({ coords }) => {
        button.disabled = false;
        const point = { lat: coords.latitude, lon: coords.longitude };
        if (validPoint(point)) locate(point);
        else failure();
      }, failure, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
    } catch {
      failure();
    }
  });
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
