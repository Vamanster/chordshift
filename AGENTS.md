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

2. **Fretboard** (lines 72–130): 12 frets built dynamically, acting as a capo. Pointer events (touch, mouse, pen): tap a fret to place the capo, drag to slide it, tap the capo fret again to remove it. `setCapo(n)` sets `transposeAmount` and re-transposes. Marker dots at frets 3,5,7,9,12.

3. **Chord Data**: 16 chord dictionaries (`fifths`, `min`, `sevenths`, `aug`, `dim`, `m7`, `maj`, `maj7`, `sus2`, `sus4`, `m6`, `m9`, `m11`, `madd9`, `mMaj7`, `m7b5`) each mapping chord names to note arrays (pitch classes). `chordLists` aggregates them.

4. **Chord Picker**: Bottom-sheet selector (`#chord-sheet` in `index.html`). Tap a root button → sheet with natural/sharp toggle, variation chips grouped by `variationGroups`, note preview, and an Add button that appends to the pre/post-transpose grids. Dismiss by tapping the backdrop or swiping the header down. `getChordNotes(name)` looks up notes across `chordLists`. Tapping a post-transpose chord highlights it on the keyboard.

5. **Keyboard** (lines 409–483): Piano keyboard built dynamically. `highlightChord(name)` highlights matching keys.

## Conventions

- Mobile-first: pointer events for the fretboard, `touch*` for the sheet swipe, `click` for taps
- Elements identified by `id` and `class`, chord data carried as `chord` attribute
- No module system — everything in global scope
- `//#region` / `// #endregion` markers for code folding

## Known issues

- Service workers require HTTP — won't work with `file://` (fixed paths to `./` so `file://` opens work for HTML/CSS/JS at least)

## Dev server

Any static file server. No build step. For local dev, update asset paths in `index.html` (line 8–9) and `service-worker.js` (lines 3–9) from `/chordshift/` to `./`.
