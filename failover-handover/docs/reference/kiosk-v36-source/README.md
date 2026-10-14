# Guestit white-label kiosk engine v36 (DADAWAN) — extracted source

Extracted on 2026-10-14 from `dadawan-kiosk-v36 (1).html` (6.6 MB single-file build) so the React port in
`kiosk-web/` can be compared against the original. Embedded base64 assets were replaced by `ASSET(name)`
placeholders; the binaries live in `kiosk-web/public/brand/` (fonts, 56 product photos, logos).

- `engine.js` — the complete application script (data, pricing engine, payment state machine, screen templates `SCR.*`, actions `ACT`).
- `styles.css` — all style blocks: theme tokens, compiled Tailwind utilities, component styles (R44 product page, loyalty, order tag, …).

The React kiosk uses `styles.css` verbatim (as `kiosk-web/src/reference.css`) and reproduces the `SCR.*` markup in JSX.
