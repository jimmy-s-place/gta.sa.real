# San Andreas Community Map

## Folder layout (repo root)
```
index.html  style.css  app.js
data/sections.json
public/map/SanAndreas-TerrainMap (1).webp
public/sections/<CELL>/your-image.jpg
```

## Add images to a section
1. Put images in `public/sections/C4/` (use the cell name).
2. Add them in `data/sections.json`:
   `"C4": [{"src": "public/sections/C4/photo1.jpg", "caption": "Optional"}]`

## Publish
1. Upload everything to your GitHub repo (`main` branch).
2. Settings → Pages → Source: `main` / root → Save.
3. Site: `https://<username>.github.io/<repo>/` (ready in ~1 min).

Test locally: `python3 -m http.server` then open http://localhost:8000
