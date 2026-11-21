import { validPoint } from './model.js?v=668c190afb0d0074eb411e3a30d184f0a3f42443';

const endpoint = 'https://get.geojs.io/v1/ip/geo.json';
const coordinate = value => typeof value === 'string' && value.trim() ? Number(value) : value;

export async function approximateLocation(request, controller, timeoutMs = 8000) {
  const { signal } = controller;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    signal.throwIfAborted();
    const response = await request(endpoint, {
      signal, mode: 'cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer'
    });
    signal.throwIfAborted();
    if (!response.ok) return { status: 'ipNetwork' };
    let data;
    try {
      data = await response.json();
    } catch (error) {
      signal.throwIfAborted();
      return { status: error instanceof SyntaxError ? 'ipInvalid' : 'ipNetwork' };
    }
    signal.throwIfAborted();
    const point = { lat: coordinate(data?.latitude), lon: coordinate(data?.longitude), source: 'ipSource' };
    if (!validPoint(point)) return { status: 'ipInvalid' };
    if (Number.isInteger(data.accuracy) && data.accuracy > 0) point.accuracyKm = data.accuracy;
    return { point };
  } catch {
    return { status: timedOut ? 'ipTimeout' : signal.aborted ? 'aborted' : 'ipNetwork' };
  } finally {
    clearTimeout(timer);
  }
}
