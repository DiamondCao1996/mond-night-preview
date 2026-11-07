// These pages are always available, independent of device or saved data.
export const SENSOR_FREE_VIEWS = Object.freeze(['settings', 'tools', 'journal', 'rhythm', 'companion', 'review', 'relax', 'feel', 'safe-space', 'forest', 'box-breathing']);

export function viewForHash(hash, doc = globalThis.document) {
 const raw = String(hash || '').replace(/^#/, '');
 const id = ({care:'companion','care-view':'companion','companion-view':'companion',settings:'settings','settings-view':'settings',device:'settings',devices:'settings','device-view':'settings',preferences:'settings',advanced:'settings',factors:'settings','factors-view':'settings',baseline:'settings','journal-view':'journal',dashboard:'journal',vision:'journal',actions:'journal',night:'rhythm','night-view':'rhythm','rhythm-view':'rhythm',nights:'rhythm',live:'rhythm',pause:'companion',music:'companion',context:'companion'})[raw] || raw;
 return SENSOR_FREE_VIEWS.includes(id) || doc?.getElementById(`${id}-view`) ? id : 'home';
}

export function revealView(host) {
 if (!host) return;
 document.querySelectorAll('.view').forEach(view => { view.hidden = view !== host; });
 host.hidden = false;
}
