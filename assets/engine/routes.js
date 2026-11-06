// These pages are always available, independent of device or saved data.
export const SENSOR_FREE_VIEWS = Object.freeze(['review', 'relax', 'feel', 'safe-space', 'forest', 'box-breathing']);

export function viewForHash(hash, doc = globalThis.document) {
 const id = String(hash || '').replace(/^#/, '');
 return SENSOR_FREE_VIEWS.includes(id) || doc?.getElementById(`${id}-view`) ? id : 'home';
}

export function revealView(host) {
 if (!host) return;
 document.querySelectorAll('.view').forEach(view => { view.hidden = view !== host; });
 host.hidden = false;
}
