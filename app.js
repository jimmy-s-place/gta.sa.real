const MAP_FILE = 'public/Map/Map.webp';
const COLS = 'ABCDEFG'.split('');   // left → right
const ROWS = 7;                     // top → bottom (1–7)

const map = L.map('map', { crs: L.CRS.Simple, minZoom: -3, maxZoom: 2, zoomSnap: 0.25, attributionControl: false });
const lightbox = document.getElementById('lightbox');
const toast = document.createElement('div');
toast.id = 'toast';
document.body.appendChild(toast);

const load = fetch('data/sections.json').then(r => r.json()).catch(() => ({}));
const img = new Image();
img.onload = async () => {
  const w = img.naturalWidth, h = img.naturalHeight;
  const bounds = [[0, 0], [h, w]];
  L.imageOverlay(img.src, bounds).addTo(map);
  map.fitBounds(bounds);
  map.setMaxBounds([[-h * 0.2, -w * 0.2], [h * 1.2, w * 1.2]]);
  drawGrid(w, h);
  addMarkers(await load, w, h);
  enableCoordHelper(w, h);
};
img.src = encodeURI(MAP_FILE);

function drawGrid(w, h) {
  const cw = w / COLS.length, ch = h / ROWS;
  COLS.forEach((col, c) => {
    for (let r = 0; r < ROWS; r++) {
      L.rectangle([[h - (r + 1) * ch, c * cw], [h - r * ch, (c + 1) * cw]],
        { color: '#fff', weight: 0.6, opacity: 0.25, fill: false, interactive: false }).addTo(map);
    }
  });
}

function addMarkers(sections, w, h) {
  const cw = w / COLS.length, ch = h / ROWS;
  const icon = L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [26, 34], iconAnchor: [13, 34], popupAnchor: [0, -32] });

  Object.entries(sections).forEach(([cell, items]) => {
    const c = COLS.indexOf(cell[0]), r = parseInt(cell.slice(1), 10) - 1;
    if (c < 0 || isNaN(r)) return;
    items.forEach((it, i) => {
      let lat, lng;
      if (typeof it.x === 'number' && typeof it.y === 'number') {
        lng = it.x / 100 * w;
        lat = h - it.y / 100 * h;
      } else {  // no position yet: spread around the cell centre
        const a = (i / items.length) * Math.PI * 2, rad = items.length > 1 ? ch * 0.18 : 0;
        lng = (c + 0.5) * cw + Math.cos(a) * rad;
        lat = h - (r + 0.5) * ch + Math.sin(a) * rad;
      }
      const box = document.createElement('div');
      box.className = 'preview';
      const im = document.createElement('img');
      im.src = encodeURI(it.src);
      im.alt = it.caption || cell;
      box.appendChild(im);
      if (it.caption) {
        const p = document.createElement('p');
        p.textContent = it.caption;
        box.appendChild(p);
      }
      box.onclick = () => {
        lightbox.querySelector('img').src = im.src;
        lightbox.querySelector('p').textContent = it.caption || '';
        lightbox.classList.remove('hidden');
      };
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(box, { minWidth: 200, maxWidth: 240 });
    });
  });
}

// Tap empty map → shows x,y (% of map) to paste into sections.json
function enableCoordHelper(w, h) {
  let t;
  map.on('click', e => {
    const x = (e.latlng.lng / w * 100).toFixed(1), y = ((h - e.latlng.lat) / h * 100).toFixed(1);
    toast.textContent = `"x": ${x}, "y": ${y}`;
    toast.style.display = 'block';
    try { navigator.clipboard.writeText(`"x": ${x}, "y": ${y}`); } catch (_) {}
    clearTimeout(t);
    t = setTimeout(() => toast.style.display = 'none', 6000);
  });
}

lightbox.onclick = () => lightbox.classList.add('hidden');
