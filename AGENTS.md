# AGENTS.md — ChordShift

## Overview

A progressive web app (PWA) for transposing guitar chords to other instruments. Vanilla JS, HTML, CSS — no build system, no framework, no dependencies.

## File structure

| File | Purpose |
|---|---|
| `index.html` | Single page layout: header, pre/post-transpose chord grids, fretboard, chord buttons, piano keyboard |
| `app.js` | All application logic (484 lines): service worker registration, chord transposition, fretboard rendering, chord data, chord picker, piano keyboard |
| `styles.css` | All styles (164 lines): layout, fretboard, keyboard, chord buttons |
| `manifest.json` | PWA manifest |
| `service-worker.js` | Cache-first service worker |
| `images/` | PWA icons (192x192, 512x512) |

## App logic (`app.js`)

Three `#region` sections:

1. **Transpose** (lines 12–70): `transposeChord(chord, steps)` shifts a chord root by semitone steps using the chromatic scale `['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']`. `updateTranspose()` applies current transpose amount to all chord nodes with a `chord` attribute.

2. **Fretboard** (lines 72–130): 12 frets built dynamically. Touch drag selects a fret number, setting `transposeAmount`. Marker dots at frets 3,5,7,9,12.

3. **Chord Data** (lines 132–289): 10 chord dictionaries (`fifths`, `min`, `sevenths`, `aug`, `dim`, `m7`, `maj`, `maj7`, `sus2`, `sus4`) each mapping chord names to note arrays. `chordLists` aggregates them. `getChordNotes()` is stubbed empty.

4. **Chord Picker** (lines 291–407): Touch-based chord selector. Tap a root button → dropdown with all chord types for that root. Tap outside → adds chord to pre/post-transpose grids. Tapping a post-transpose chord highlights it on the keyboard.

5. **Keyboard** (lines 409–483): Piano keyboard built dynamically. `highlightChord(name)` highlights matching keys.

## Conventions

- Touch events only (no pointer/mouse events) — mobile-first
- Elements identified by `id` and `class`, chord data carried as `chord` attribute
- No module system — everything in global scope
- `//#region` / `// #endregion` markers for code folding

## Known issues

- Service workers require HTTP — won't work with `file://` (fixed paths to `./` so `file://` opens work for HTML/CSS/JS at least)

## Dev server

Any static file server. No build step. For local dev, update asset paths in `index.html` (line 8–9) and `service-worker.js` (lines 3–9) from `/chordshift/` to `./`.
