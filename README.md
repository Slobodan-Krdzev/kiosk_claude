# Kiosk_2026 — Guestit kiosk workspace

| Folder | What |
|---|---|
| `kiosk-web/` | **The new kiosk** in the DADAWAN v36 engine design (React + TypeScript, static JSON fixtures). See `kiosk-web/README.md`. |
| `failover-handover/` | Handover package: rules (`CLAUDE.md`), architecture, contracts, v36 reference, templates. |
| `failover-handover/status/` | Phase notes and deviations (`PHASE-1.md`, `DEVIATIONS.md`). |
| `kiosk-android/` | Reserved for the Kotlin Guestit Launcher that will wrap the web kiosk. Empty. |
| `pos/`, `emenu-android/` | Reserved for the POS / eMenu code if it is ever added. Empty. |

Quick start:

```bash
cd kiosk-web && npm install && npm run dev
```
