const MAP_FILE = 'public/map/Map.webp';
const COLS = 'ABCDEFG'.split('');   // left → right
const ROWS = 7;                     // top → bottom (1–7)

const map = L.map('map', { crs: L.CRS.Simple, minZoom: -3, maxZoom: 2, zoomSnap: 0.25, attributionControl: false });
const panel = document.getElementById('panel');
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
let sections = {};

fetch('data/sections.json').then(r => r.json()).then(d => sections = d).catch(() => {});

const img = new Image();
img.onload = () => {
  const w = img.naturalWidth, h = img.naturalHeight;
  const bounds = [[0, 0], [h, w]];
  L.imageOverlay(img.src, bounds).addTo(map);
  map.fitBounds(bounds);
  map.setMaxBounds([[-h * 0.2, -w * 0.2], [h * 1.2, w * 1.2]]);
  drawGrid(w, h);
};
img.src = encodeURI(MAP_FILE);

function drawGrid(w, h) {
  const cw = w / COLS.length, ch = h / ROWS;
  let active = null;
  const base = { color: '#ffffff', weight: 0.6, opacity: 0.35, fillOpacity: 0, fillColor: '#ffd23f' };

  COLS.forEach((col, c) => {
    for (let r = 0; r < ROWS; r++) {
      const id = col + (r + 1);
      const rect = L.rectangle(
        [[h - (r + 1) * ch, c * cw], [h - r * ch, (c + 1) * cw]], base
      ).addTo(map);

      rect.on('mouseover', () => { if (rect !== active) rect.setStyle({ fillOpacity: 0.15 }); });
      rect.on('mouseout',  () => { if (rect !== active) rect.setStyle({ fillOpacity: 0 }); });
      rect.on('click', () => {
        if (active) active.setStyle({ fillOpacity: 0, weight: 0.6, opacity: 0.35 });
        active = rect;
        rect.setStyle({ fillOpacity: 0.25, weight: 2, opacity: 1 });
        openPanel(id);
      });
    }
  });

  document.getElementById('close').onclick = () => {
    panel.classList.add('hidden');
    if (active) active.setStyle({ fillOpacity: 0, weight: 0.6, opacity: 0.35 });
    active = null;
  };
}

function openPanel(id) {
  document.getElementById('cell-title').textContent = 'Section ' + id;
  gallery.replaceChildren();
  const items = sections[id] || [];
  if (!items.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No images yet for this section.';
    gallery.appendChild(p);
  }
  items.forEach(it => {
    const el = document.createElement('img');
    el.src = encodeURI(it.src);
    el.alt = it.caption || id;
    el.loading = 'lazy';
    el.onclick = () => {
      lightbox.querySelector('img').src = el.src;
      lightbox.querySelector('p').textContent = it.caption || '';
      lightbox.classList.remove('hidden');
    };
    gallery.appendChild(el);
  });
  panel.classList.remove('hidden');
}

lightbox.onclick = () => lightbox.classList.add('hidden');
