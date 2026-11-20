# LAMHAH Life — Phase 1.1: Dumat Al Jandal Old-Town Blockout

This is the first geographically anchored prototype for LAMHAH Life, a browser-based 3D life simulation.

## Geographic anchors
- Marid Castle: 29.81115, 39.86717
- Omar ibn al-Khattab Mosque: 29.81203, 39.86762
- Al-Dar' historic district: 29.811186, 39.867053

The surrounding street layout and non-landmark building footprints are illustrative 3D blockout geometry, not a survey-grade reconstruction. The first pass focuses on the historic core and nearby blocks; it does not yet model the whole governorate or the lake district.

## Run locally
Requires Node.js 20.19+ (or 22.12+) and npm.
```bash
npm install
npm run dev
```
Open the Vite URL shown in the terminal, normally http://localhost:5173. The WebSocket prototype server listens on port 2567.

## Controls
- W A S D: move
- Shift: run
- V: toggle first-/third-person camera
- Drag pointer over the scene: rotate camera

## Current scope
- Three.js 3D scene and lighting
- A 450 m initial district planning radius around the heritage core
- Coordinate-anchored Marid Castle, Omar Mosque, and Al-Dar' Quarter
- Stylized landmark massing and nearby generic buildings/roads
- Basic player movement, camera toggle, and WebSocket presence

## Accuracy note
This is a playable visual blockout, not yet a precise reconstruction of every street or building. For the next accuracy pass, import verified road centerlines/building footprints from an authoritative geospatial dataset or a licensed survey/orthophoto, then replace the illustrative street/building geometry.
