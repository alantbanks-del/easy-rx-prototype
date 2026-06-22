# ROE Easy-Rx Prototype

A mobile-first, voice-enabled dental Rx wizard for ROE Dental Laboratory.

**The entire app is a single self-contained HTML file** — all JavaScript, CSS, and
images (base64) are embedded. No build step, no dependencies, runs offline.

- `index.html` — the app (what Netlify serves).
- `easy-rx-prototype.html` — identical copy under its working name (source of truth during editing).

> `index.html` and `easy-rx-prototype.html` are byte-for-byte identical. Keep them in sync.

## Engines

1. Fixed & Implants
2. Removable
3. Full Arch
4. Splints & Guards
5. Surgical Guides
6. Orthodontic Devices

Plus a launcher with **Removable Repairs (coming soon)** and an **Add requested information** page
(patient name, case ID, drag-and-drop files, notes).

## Run locally

Just open `index.html` in a browser — that's it. Or serve it:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy (Netlify)

Static site, no build. `netlify.toml` publishes the repo root and serves `index.html`.

- **GitHub → Netlify:** connect this repo; build command empty, publish directory `.`.
- **Netlify Drop:** drag the folder onto https://app.netlify.com/drop for a quick preview.

## House rules (for edits)

- Mobile/phone-first, no horizontal scroll. Desktop breakpoint 820px.
- No prices on any engine **except** Surgical Guides.
- Never invent ROE product codes or prices — verified data only.
- Dual-arch charts always stack (Upper over Lower), never side-by-side.
- Phones cache hard — hard-refresh after every deploy.
