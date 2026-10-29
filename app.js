if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      }).catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

//#region Transpose

function transposeChord(chord, steps) {
  // Define the chromatic scale
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Helper function to get the root note and its accidental (e.g., 'C', 'C#')
  function getRootNote(chord) {
    const match = chord.match(/^[A-G]#?/);
    return match ? match[0] : null;
  }

  // Get the root note and the modifiers (everything after the root, e.g. 'm', 'mMaj7', 'm7b5')
  const rootNote = getRootNote(chord);
  const modifiers = rootNote ? chord.slice(rootNote.length) : '';
  
  // Find the index of the root note in the chromatic scale
  const index = notes.indexOf(rootNote);

  if (index === -1) {
    throw new Error('Invalid chord root note');
  }

  // Transpose the chord root by the specified number of steps
  const transposedIndex = (index + steps + notes.length) % notes.length;
  const transposedRoot = notes[transposedIndex];

  // Return the transposed chord with the original modifiers
  return transposedRoot + modifiers;
}

const progressionEl = document.getElementById("progression"); // original chords
const transposedEl = document.getElementById("transposed");
const transposeAmountText = document.getElementById("transpose-amount");

let transposeAmount = 0;

// Original chord names, in progression order
function getOriginals() {
  return Array.from(progressionEl.children).map(chip => chip.getAttribute("chord"));
}

// Transposed chord names, in progression order
function getProgression() {
  return Array.from(progressionEl.children).map(chip => transposeChord(chip.getAttribute("chord"), transposeAmount));
}

// Rebuild the transposed row to match the originals' order and the capo
function updateTranspose() {
  transposedEl.innerHTML = "";
  getProgression().forEach((chordName, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chord-chip transposed";
    chip.textContent = chordName;
    chip.addEventListener("click", () => selectChord(progressionEl.children[index], "transposed"));
    transposedEl.appendChild(chip);
  });

  transposeAmountText.textContent = transposeAmount === 0 ? "No capo" : `Fret ${transposeAmount} · +${transposeAmount}`;

  // Keep the selection and keyboard in step
  renderSelection();
}

//#endregion

//#region Fretboard

const instrument_1 = document.getElementById("instrument-1");
let frets = document.querySelectorAll(".fret");

let capoDragging = false;
let capoMoved = false;
let capoTappedCurrent = false;

// Find the fret under the pointer by x position only, so a drag that drifts off the bar still tracks
function fretAtX(x) {
  for (const fret of frets) {
    const rect = fret.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right) {
      return parseInt(fret.getAttribute("fret-number"));
    }
  }
  return null;
}

// Place the capo on a fret (0 = no capo) and transpose
function setCapo(amount) {
  transposeAmount = amount;
  frets.forEach(fret => {
    fret.classList.toggle("capo", parseInt(fret.getAttribute("fret-number")) === amount);
  });
  updateTranspose();
}

// Pointer events cover touch, mouse and pen: tap a fret to place the capo, drag to slide it
instrument_1.addEventListener("pointerdown", (event) => {
  const fretNumber = fretAtX(event.clientX);
  if (fretNumber === null) return;

  instrument_1.setPointerCapture(event.pointerId);
  capoDragging = true;
  capoMoved = false;
  capoTappedCurrent = fretNumber === transposeAmount;
  setCapo(fretNumber);
});

instrument_1.addEventListener("pointermove", (event) => {
  if (!capoDragging) return;

  const fretNumber = fretAtX(event.clientX);
  if (fretNumber !== null && fretNumber !== transposeAmount) {
    capoMoved = true;
    setCapo(fretNumber);
  }
});

function endCapoDrag() {
  if (!capoDragging) return;
  capoDragging = false;

  // Tapping the fret the capo is already on removes it
  if (capoTappedCurrent && !capoMoved) {
    setCapo(0);
  }
}

instrument_1.addEventListener("pointerup", endCapoDrag);
instrument_1.addEventListener("pointercancel", endCapoDrag);

// Frets run from 12 (left) to 1 (right, next to the nut), widening towards the nut
for (let i = 0; i < 12; i++) {
  const fretNumber = 12 - i;
  const fret = document.createElement("div");
  fret.classList.add("fret");
  fret.style.flex = `${1 + i * 0.04}`;
  fret.setAttribute("fret-number", fretNumber);

  const inlays = { 3: 1, 5: 1, 7: 1, 9: 1, 12: 2 }[fretNumber] || 0;
  for (let d = 0; d < inlays; d++) {
    const inlay = document.createElement("span");
    inlay.className = "inlay";
    fret.appendChild(inlay);
  }

  instrument_1.appendChild(fret);
}

frets = document.querySelectorAll(".fret");

// #endregion

//#region Chord Data
const fifths = { 
  'A#5': ['A#', 'F'],
  'A5': ['A', 'E'],   
  'B5': ['B', 'F#'],  
  'C#5': ['C#', 'G#'],
  'C5': ['C', 'G'],   
  'D#5': ['D#', 'A#'],
  'D5': ['D', 'A'],   
  'E5': ['E', 'B'],   
  'F#5': ['F#', 'C#'],
  'F5': ['F', 'C'],   
  'G#5': ['G#', 'D#'],
  'G5': ['G', 'D']
};

const sevenths = {
  'A#7': ['A#', 'D', 'F', 'G#'],
  'A7': ['A', 'C#', 'E', 'G'],  
  'B7': ['B', 'D#', 'F#', 'A'], 
  'C#7': ['C#', 'F', 'G#', 'B'], 
  'C7': ['C', 'E', 'G', 'A#'],   
  'D#7': ['D#', 'G', 'A#', 'C#'],
  'D7': ['D', 'F#', 'A', 'C'],   
  'E7': ['E', 'G#', 'B', 'D'],   
  'F#7': ['F#', 'A#', 'C#', 'E'],
  'F7': ['F', 'A', 'C', 'D#'],
  'G#7': ['G#', 'C', 'D#', 'F#'],
  'G7': ['G', 'B', 'D', 'F']
};

const aug = {
  'A#aug': ['A#', 'D', 'F#'],
  'Aaug': ['A', 'C#', 'F'],
  'Baug': ['B', 'D#', 'G'],
  'C#aug': ['C#', 'F', 'A'],
  'Caug': ['C', 'E', 'G#'],
  'D#aug': ['D#', 'G', 'B'],
  'Daug': ['D', 'F#', 'A#'],
  'Eaug': ['E', 'G#', 'C'],
  'F#aug': ['F#', 'A#', 'D'],
  'Faug': ['F', 'A', 'C#'],
  'G#aug': ['G#', 'C', 'E'],
  'Gaug': ['G', 'B', 'D#']
};

const dim = {
  'A#dim': ['A#', 'C#', 'E'],
  'Adim': ['A', 'C', 'D#'],
  'Bdim': ['B', 'D', 'F'],
  'C#dim': ['C#', 'E', 'G'],
  'Cdim': ['C', 'D#', 'F#'],
  'D#dim': ['D#', 'F#', 'A'],
  'Ddim': ['D', 'F', 'G#'],
  'Edim': ['E', 'G', 'A#'],
  'F#dim': ['F#', 'A', 'C'],
  'Fdim': ['F', 'G#', 'B'],
  'G#dim': ['G#', 'B', 'D'],
  'Gdim': ['G', 'A#', 'C#']
};

const m7 = {
  'A#m7': ['A#', 'C#', 'F', 'G#'],
  'Am7': ['A', 'C', 'E', 'G'],
  'Bm7': ['B', 'D', 'F#', 'A'],
  'C#m7': ['C#', 'E', 'G#', 'B'],
  'Cm7': ['C', 'D#', 'G', 'A#'],
  'D#m7': ['D#', 'F#', 'A#', 'C#'],
  'Dm7': ['D', 'F', 'A', 'C'],
  'Em7': ['E', 'G', 'B', 'D'],
  'F#m7': ['F#', 'A', 'C#', 'E'],
  'Fm7': ['F', 'G#', 'C', 'D#'],
  'G#m7': ['G#', 'B', 'D#', 'F#'],
  'Gm7': ['G', 'A#', 'D', 'F']
};

const maj = {
  'A': ['A', 'C#', 'E'],
  'A#': ['A#', 'D', 'F'],
  'B': ['B', 'D#', 'F#'],
  'C': ['C', 'E', 'G'],
  'C#': ['C#', 'F', 'G#'],
  'D': ['D', 'F#', 'A'],
  'D#': ['D#', 'G', 'A#'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'F#': ['F#', 'A#', 'C#'],
  'G': ['G', 'B', 'D'],
  'G#': ['G#', 'C', 'D#']
};

const maj7 = {
  'A#maj7': ['A#', 'D', 'F', 'A'],
  'Amaj7': ['A', 'C#', 'E', 'G#'],
  'Bmaj7': ['B', 'D#', 'F#', 'A#'],
  'C#maj7': ['C#', 'F', 'G#', 'C'],
  'Cmaj7': ['C', 'E', 'G', 'B'],
  'D#maj7': ['D#', 'G', 'A#', 'D'],
  'Dmaj7': ['D', 'F#', 'A', 'C#'],
  'Emaj7': ['E', 'G#', 'B', 'D#'],
  'F#maj7': ['F#', 'A#', 'C#', 'F'],
  'Fmaj7': ['F', 'A', 'C', 'E'],
  'G#maj7': ['G#', 'C', 'D#', 'G'],
  'Gmaj7': ['G', 'B', 'D', 'F#']
};

const min = {
  'A#min': ['A#', 'C#', 'F'],
  'Amin': ['A', 'C', 'E'],
  'Bmin': ['B', 'D', 'F#'],
  'C#min': ['C#', 'E', 'G#'],
  'Cmin': ['C', 'D#', 'G'],
  'D#min': ['D#', 'F#', 'A#'],
  'Dmin': ['D', 'F', 'A'],
  'Emin': ['E', 'G', 'B'],
  'F#min': ['F#', 'A', 'C#'],
  'Fmin': ['F', 'G#', 'C'],
  'G#min': ['G#', 'B', 'D#'],
  'Gmin': ['G', 'A#', 'D']
};

const sus2 = {
  'A#sus2': ['A#', 'C', 'F'],
  'Asus2': ['A', 'B', 'E'],
  'Bsus2': ['B', 'C#', 'F#'],
  'C#sus2': ['C#', 'D#', 'G#'],
  'Csus2': ['C', 'D', 'G'],
  'D#sus2': ['D#', 'F', 'A#'],
  'Dsus2': ['D', 'E', 'A'],
  'Esus2': ['E', 'F#', 'B'],
  'F#sus2': ['F#', 'G#', 'C#'],
  'Fsus2': ['F', 'G', 'C'],
  'G#sus2': ['G#', 'A#', 'D#'],
  'Gsus2': ['G', 'A', 'D']
};

const sus4 = {
  'A#sus4': ['A#', 'D#', 'F'],
  'Asus4': ['A', 'D', 'E'],
  'Bsus4': ['B', 'E', 'F#'],
  'C#sus4': ['C#', 'F#', 'G#'],
  'Csus4': ['C', 'F', 'G'],
  'D#sus4': ['D#', 'G#', 'A#'],
  'Dsus4': ['D', 'G', 'A'],
  'Esus4': ['E', 'A', 'B'],
  'F#sus4': ['F#', 'B', 'C#'],
  'Fsus4': ['F', 'A#', 'C'],
  'G#sus4': ['G#', 'C#', 'D#'],
  'Gsus4': ['G', 'C', 'D']
};

const m6 = {
  'A#m6': ['A#', 'C#', 'F', 'G'],
  'Am6': ['A', 'C', 'E', 'F#'],
  'Bm6': ['B', 'D', 'F#', 'G#'],
  'C#m6': ['C#', 'E', 'G#', 'A#'],
  'Cm6': ['C', 'D#', 'G', 'A'],
  'D#m6': ['D#', 'F#', 'A#', 'C'],
  'Dm6': ['D', 'F', 'A', 'B'],
  'Em6': ['E', 'G', 'B', 'C#'],
  'F#m6': ['F#', 'A', 'C#', 'D#'],
  'Fm6': ['F', 'G#', 'C', 'D'],
  'G#m6': ['G#', 'B', 'D#', 'F'],
  'Gm6': ['G', 'A#', 'D', 'E']
};

const m9 = {
  'A#m9': ['A#', 'C#', 'F', 'G#', 'C'],
  'Am9': ['A', 'C', 'E', 'G', 'B'],
  'Bm9': ['B', 'D', 'F#', 'A', 'C#'],
  'C#m9': ['C#', 'E', 'G#', 'B', 'D#'],
  'Cm9': ['C', 'D#', 'G', 'A#', 'D'],
  'D#m9': ['D#', 'F#', 'A#', 'C#', 'F'],
  'Dm9': ['D', 'F', 'A', 'C', 'E'],
  'Em9': ['E', 'G', 'B', 'D', 'F#'],
  'F#m9': ['F#', 'A', 'C#', 'E', 'G#'],
  'Fm9': ['F', 'G#', 'C', 'D#', 'G'],
  'G#m9': ['G#', 'B', 'D#', 'F#', 'A#'],
  'Gm9': ['G', 'A#', 'D', 'F', 'A']
};

const m11 = {
  'A#m11': ['A#', 'C#', 'F', 'G#', 'C', 'D#'],
  'Am11': ['A', 'C', 'E', 'G', 'B', 'D'],
  'Bm11': ['B', 'D', 'F#', 'A', 'C#', 'E'],
  'C#m11': ['C#', 'E', 'G#', 'B', 'D#', 'F#'],
  'Cm11': ['C', 'D#', 'G', 'A#', 'D', 'F'],
  'D#m11': ['D#', 'F#', 'A#', 'C#', 'F', 'G#'],
  'Dm11': ['D', 'F', 'A', 'C', 'E', 'G'],
  'Em11': ['E', 'G', 'B', 'D', 'F#', 'A'],
  'F#m11': ['F#', 'A', 'C#', 'E', 'G#', 'B'],
  'Fm11': ['F', 'G#', 'C', 'D#', 'G', 'A#'],
  'G#m11': ['G#', 'B', 'D#', 'F#', 'A#', 'C#'],
  'Gm11': ['G', 'A#', 'D', 'F', 'A', 'C']
};

const madd9 = {
  'A#madd9': ['A#', 'C#', 'F', 'C'],
  'Amadd9': ['A', 'C', 'E', 'B'],
  'Bmadd9': ['B', 'D', 'F#', 'C#'],
  'C#madd9': ['C#', 'E', 'G#', 'D#'],
  'Cmadd9': ['C', 'D#', 'G', 'D'],
  'D#madd9': ['D#', 'F#', 'A#', 'F'],
  'Dmadd9': ['D', 'F', 'A', 'E'],
  'Emadd9': ['E', 'G', 'B', 'F#'],
  'F#madd9': ['F#', 'A', 'C#', 'G#'],
  'Fmadd9': ['F', 'G#', 'C', 'G'],
  'G#madd9': ['G#', 'B', 'D#', 'A#'],
  'Gmadd9': ['G', 'A#', 'D', 'A']
};

const mMaj7 = {
  'A#mMaj7': ['A#', 'C#', 'F', 'A'],
  'AmMaj7': ['A', 'C', 'E', 'G#'],
  'BmMaj7': ['B', 'D', 'F#', 'A#'],
  'C#mMaj7': ['C#', 'E', 'G#', 'C'],
  'CmMaj7': ['C', 'D#', 'G', 'B'],
  'D#mMaj7': ['D#', 'F#', 'A#', 'D'],
  'DmMaj7': ['D', 'F', 'A', 'C#'],
  'EmMaj7': ['E', 'G', 'B', 'D#'],
  'F#mMaj7': ['F#', 'A', 'C#', 'F'],
  'FmMaj7': ['F', 'G#', 'C', 'E'],
  'G#mMaj7': ['G#', 'B', 'D#', 'G'],
  'GmMaj7': ['G', 'A#', 'D', 'F#']
};

const m7b5 = {
  'A#m7b5': ['A#', 'C#', 'E', 'G#'],
  'Am7b5': ['A', 'C', 'D#', 'G'],
  'Bm7b5': ['B', 'D', 'F', 'A'],
  'C#m7b5': ['C#', 'E', 'G', 'B'],
  'Cm7b5': ['C', 'D#', 'F#', 'A#'],
  'D#m7b5': ['D#', 'F#', 'A', 'C#'],
  'Dm7b5': ['D', 'F', 'G#', 'C'],
  'Em7b5': ['E', 'G', 'A#', 'D'],
  'F#m7b5': ['F#', 'A', 'C', 'E'],
  'Fm7b5': ['F', 'G#', 'B', 'D#'],
  'G#m7b5': ['G#', 'B', 'D', 'F#'],
  'Gm7b5': ['G', 'A#', 'C#', 'F']
};

const chordLists = [fifths, min, sevenths, aug, dim, m7, maj, maj7, sus2, sus4, m6, m9, m11, madd9, mMaj7, m7b5];

//#endregion

//#region Voicing

// Right-hand fingers used for a voicing of n notes, low to high
const fingerSets = { 1: [1], 2: [1, 5], 3: [1, 3, 5], 4: [1, 2, 3, 5], 5: [1, 2, 3, 4, 5] };
const voicingLow = 48;  // C3
const voicingHigh = 71; // B4
const middleC = 60;

function isBlackKey(midi) {
  return keys[midi % 12].includes("#");
}

// Every combination taking one item from each list
function combine(lists) {
  return lists.reduce((combos, list) => combos.flatMap(combo => list.map(item => [...combo, item])), [[]]);
}

// How awkward / muddy a voicing is on its own (lower is better)
function voicingCost(voicing, root) {
  const fingers = fingerSets[voicing.length];
  const lowest = voicing[0];
  const highest = voicing[voicing.length - 1];
  let cost = (highest - lowest) * 0.15;

  for (let i = 1; i < voicing.length; i++) {
    const gap = voicing[i] - voicing[i - 1];
    // Comfortable reach grows with the number of fingers between, and the thumb reaches further
    const reach = (fingers[i] - fingers[i - 1]) * 2 + (fingers[i - 1] === 1 ? 2 : 0);
    cost += Math.max(0, gap - reach) * 0.5;

    // Close intervals below E3 sound muddy
    if (gap <= 4 && voicing[i - 1] < 52) {
      cost += 1.5;
    }
  }

  if (isBlackKey(lowest)) cost += 1;    // thumb on a black key
  if (isBlackKey(highest)) cost += 0.5; // little finger on a black key
  if (lowest % 12 !== root) cost += 1;  // prefer the root in the bass

  const centre = voicing.reduce((sum, key) => sum + key, 0) / voicing.length;
  cost += Math.abs(centre - middleC) * 0.08;

  return cost;
}

// Every playable one-hand voicing of a chord within the keyboard range
function getVoicings(chordName) {
  const notes = getChordNotes(chordName);
  if (!notes) return [];

  const pitchClasses = notes.map(note => keys.indexOf(note));
  const root = pitchClasses[0];

  // Try the full chord, and the chord without a perfect fifth (the first note pianists drop)
  const noteSets = [{ pitchClasses, dropped: 0 }];
  const fifth = pitchClasses.indexOf((root + 7) % 12);
  if (fifth > 0 && pitchClasses.length > 2) {
    noteSets.push({ pitchClasses: pitchClasses.filter((_, i) => i !== fifth), dropped: 1 });
  }

  const voicings = [];
  const seen = new Set();

  noteSets.forEach(({ pitchClasses: set, dropped }) => {
    if (set.length > 5) return; // more notes than fingers

    for (let low = voicingLow; low <= voicingHigh; low++) {
      if (!set.includes(low % 12)) continue;

      // Keys within the hand span for each remaining note
      const high = Math.min(low + settings.handSpan, voicingHigh);
      const options = set.filter(pc => pc !== low % 12).map(pc => {
        const candidates = [];
        for (let key = low + 1; key <= high; key++) {
          if (key % 12 === pc) candidates.push(key);
        }
        return candidates;
      });
      if (options.some(candidates => candidates.length === 0)) continue;

      combine(options).forEach(combo => {
        const voicing = [low, ...combo].sort((a, b) => a - b);
        const id = voicing.join(",");
        if (seen.has(id)) return;
        seen.add(id);

        voicings.push({
          keys: voicing,
          fingers: fingerSets[voicing.length],
          cost: voicingCost(voicing, root) + dropped
        });
      });
    }
  });

  return voicings;
}

// Cost of moving the hand from one voicing to the next
function transitionCost(from, to) {
  if (!from) return 0;
  const shared = to.keys.filter(key => from.keys.includes(key)).length;
  const shift = Math.abs(to.keys[0] - from.keys[0]) +
    Math.abs(to.keys[to.keys.length - 1] - from.keys[from.keys.length - 1]);
  return shift * 0.25 - shared * 0.5;
}

// Best voicing for each chord in a progression (Viterbi), trading per-chord cost against hand movement.
// Chords with no voicing get null.
function voiceProgression(chordNames) {
  let paths = [{ voicings: [], last: null, cost: 0 }];

  chordNames.forEach(chordName => {
    const candidates = getVoicings(chordName);
    if (candidates.length === 0) {
      paths = paths.map(path => ({ ...path, voicings: [...path.voicings, null] }));
      return;
    }

    paths = candidates.map(candidate => {
      let best = null;
      paths.forEach(path => {
        const cost = path.cost + candidate.cost + transitionCost(path.last, candidate);
        if (!best || cost < best.cost) {
          best = { voicings: [...path.voicings, candidate], last: candidate, cost };
        }
      });
      return best;
    });
  });

  return paths.reduce((best, path) => (path.cost < best.cost ? path : best)).voicings;
}

//#endregion

//#region Chords picker

const chordButtons = document.querySelectorAll(".chord-button");
const chordSheet = document.getElementById("chord-sheet");
const sheetRoots = document.getElementById("sheet-roots");
const sheetPreview = document.getElementById("sheet-preview");
const sheetNotes = document.getElementById("sheet-notes");
const sheetVariations = document.getElementById("sheet-variations");
const sheetAdd = document.getElementById("sheet-add");

// Chord suffixes offered in the picker, grouped by family ('' is the plain major triad)
const variationGroups = [
  { label: "Major", suffixes: ["", "maj7", "5", "sus2", "sus4", "aug"] },
  { label: "Minor", suffixes: ["min", "m6", "m7", "m9", "m11", "madd9", "mMaj7", "m7b5"] },
  { label: "Dominant & diminished", suffixes: ["7", "dim"] }
];

let activeButton = null;
let sheetRoot = "A";
let sheetSuffix = "";

function getChordNotes(chordName) {
  for (const dict of chordLists) {
    if (dict[chordName]) {
      return dict[chordName];
    }
  }
  return null;
}

function splitChord(chordName) {
  const root = chordName.match(/^[A-G]#?/)[0];
  return { root, suffix: chordName.slice(root.length) };
}

function addChord(newChord) {
  const chip = document.createElement("div");
  chip.className = "chord-chip";
  chip.setAttribute("chord", newChord);
  chip.innerHTML = `<span class="chip-label">${newChord}</span>` +
    `<button type="button" class="chip-remove" aria-label="Remove ${newChord}">×</button>`;

  chip.querySelector(".chip-remove").addEventListener("click", (e) => {
    e.stopPropagation();
    if (selection && selection.chip === chip) {
      selection = null;
    }
    chip.remove();
    clearHighlight();
    updateTranspose();
  });

  progressionEl.appendChild(chip);
  updateTranspose();
}

// The chord last tapped: its original chip, and which row it was tapped in ("original" or "transposed")
let selection = null;

function selectChord(chip, row) {
  selection = { chip, row };
  renderSelection();
}

// Highlight the selected chip and show only that chord on the keyboard; an original also shows its remove button
function renderSelection() {
  clearCardSelection();
  if (!selection || !selection.chip.isConnected) {
    selection = null;
    return;
  }

  const index = Array.from(progressionEl.children).indexOf(selection.chip);
  const isOriginal = selection.row === "original";
  const shown = isOriginal ? selection.chip : transposedEl.children[index];
  shown.classList.add("selected");
  selection.chip.classList.toggle("editing", isOriginal);
  showChord(isOriginal ? selection.chip.getAttribute("chord") : shown.textContent, index, selection.row);
}

function clearCardSelection() {
  document.querySelectorAll(".chord-chip.selected").forEach(chip => chip.classList.remove("selected", "editing"));
}

// Drag an original chord to reorder the progression; a tap without movement selects it
let dragChip = null;
let dragStart = null;
let dragMoved = false;

progressionEl.addEventListener("pointerdown", (e) => {
  const chip = e.target.closest(".chord-chip");
  if (!chip || e.target.closest(".chip-remove")) return;

  dragChip = chip;
  dragStart = { x: e.clientX, y: e.clientY };
  dragMoved = false;
  progressionEl.setPointerCapture(e.pointerId);
});

progressionEl.addEventListener("pointermove", (e) => {
  if (!dragChip) return;

  if (!dragMoved) {
    if (Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) < 8) return;
    dragMoved = true;
    dragChip.classList.add("dragging");
  }

  // Move the dragged chip before or after whichever chip the pointer is over
  for (const other of progressionEl.children) {
    if (other === dragChip) continue;
    const rect = other.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      const before = e.clientX < rect.left + rect.width / 2;
      progressionEl.insertBefore(dragChip, before ? other : other.nextSibling);
      break;
    }
  }
});

function endChipDrag() {
  if (!dragChip) return;
  const chip = dragChip;
  dragChip = null;

  if (dragMoved) {
    chip.classList.remove("dragging");
    updateTranspose();
  }
  else {
    selectChord(chip, "original");
  }
}

progressionEl.addEventListener("pointerup", endChipDrag);
progressionEl.addEventListener("pointercancel", () => {
  dragMoved = true; // a cancelled gesture never counts as a tap
  endChipDrag();
});

// Dock buttons show the last chord picked for their letter: root large, suffix small underneath
function setDockLabel(button, chordName) {
  const { root, suffix } = splitChord(chordName);
  const label = button.querySelector(".chord-text");
  label.textContent = root;
  if (suffix) {
    const small = document.createElement("span");
    small.className = "chord-suffix";
    small.textContent = suffix;
    label.appendChild(small);
  }
}

// Show the chord being picked on the keyboard
function previewSheetChord() {
  clearCardSelection();
  selection = null;
  showChord(sheetRoot + sheetSuffix, undefined, "original");
}

function openSheet(sheet) {
  sheet.classList.add("open");
  sheet.setAttribute("aria-hidden", "false");
}

function closeSheet(sheet) {
  sheet.querySelector(".sheet-panel").style.transform = "";
  sheet.classList.remove("open");
  sheet.setAttribute("aria-hidden", "true");
}

// Every sheet closes on a backdrop tap or by swiping its header down
document.querySelectorAll(".sheet").forEach(sheet => {
  const panel = sheet.querySelector(".sheet-panel");
  const grabber = sheet.querySelector(".sheet-grabber");
  let dragStartY = null;
  let dragOffset = 0;

  sheet.querySelector(".sheet-backdrop").addEventListener("click", () => closeSheet(sheet));

  grabber.addEventListener("touchstart", (e) => {
    dragStartY = e.touches[0].clientY;
    dragOffset = 0;
    panel.classList.add("dragging");
  }, { passive: true });

  grabber.addEventListener("touchmove", (e) => {
    if (dragStartY === null) return;
    dragOffset = Math.max(0, e.touches[0].clientY - dragStartY);
    panel.style.transform = `translateY(${dragOffset}px)`;
  }, { passive: true });

  grabber.addEventListener("touchend", () => {
    panel.classList.remove("dragging");
    if (dragOffset > 80) {
      closeSheet(sheet);
    }
    else {
      panel.style.transform = "";
    }
    dragStartY = null;
  });
});

// Build the variation chips once; they only depend on the suffix
variationGroups.forEach(group => {
  const heading = document.createElement("div");
  heading.className = "variation-heading";
  heading.textContent = group.label;
  sheetVariations.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "variation-grid";
  group.suffixes.forEach(suffix => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "variation-chip";
    chip.dataset.suffix = suffix;
    chip.textContent = suffix || "maj";
    chip.addEventListener("click", () => {
      sheetSuffix = suffix;
      renderSheet();
      previewSheetChord();
    });
    grid.appendChild(chip);
  });
  sheetVariations.appendChild(grid);
});

function renderSheet() {
  const chordName = sheetRoot + sheetSuffix;
  sheetPreview.textContent = chordName;
  sheetNotes.textContent = (getChordNotes(chordName) || []).join("  ·  ");
  sheetAdd.textContent = `Add ${chordName}`;

  sheetRoots.querySelectorAll(".root-toggle").forEach(toggle => {
    toggle.classList.toggle("selected", toggle.dataset.root === sheetRoot);
  });
  sheetVariations.querySelectorAll(".variation-chip").forEach(chip => {
    chip.classList.toggle("selected", chip.dataset.suffix === sheetSuffix);
  });
}

function openChordSheet(button) {
  activeButton = button;
  ({ root: sheetRoot, suffix: sheetSuffix } = splitChord(button.getAttribute("chord")));

  // Natural / sharp toggle for this button's letter (E and B have no sharp)
  const natural = sheetRoot[0];
  const roots = (natural === "E" || natural === "B") ? [natural] : [natural, natural + "#"];
  sheetRoots.innerHTML = "";
  roots.forEach(root => {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "root-toggle";
    toggle.dataset.root = root;
    toggle.textContent = root;
    toggle.addEventListener("click", () => {
      sheetRoot = root;
      renderSheet();
      previewSheetChord();
    });
    sheetRoots.appendChild(toggle);
  });

  renderSheet();
  previewSheetChord();
  sheetVariations.scrollTop = 0;
  openSheet(chordSheet);
}

chordButtons.forEach(button => {
  button.addEventListener("click", () => openChordSheet(button));
});

sheetAdd.addEventListener("click", () => {
  const chordName = sheetRoot + sheetSuffix;
  activeButton.setAttribute("chord", chordName);
  setDockLabel(activeButton, chordName);
  addChord(chordName);
  closeSheet(chordSheet);
});

//#endregion

//#region Settings

const settingsKey = "chordshift-settings";
const settings = { smartVoicing: false, handSpan: 12, theme: "dark" };

try {
  Object.assign(settings, JSON.parse(localStorage.getItem(settingsKey)) || {});
} catch (e) {
  // Storage unavailable (private mode, blocked site data): keep the defaults
}

function saveSettings() {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  } catch (e) {
    // Settings still apply for this visit
  }
}

const settingsSheet = document.getElementById("settings-sheet");
const settingsButton = document.getElementById("settings-button");
const smartVoicingToggle = document.getElementById("setting-smart-voicing");
const handSpanSetting = document.getElementById("setting-hand-span");
const themeSetting = document.getElementById("setting-theme");

// Dark is the default; light is a variant
function applyTheme() {
  document.documentElement.dataset.theme = settings.theme;
  document.querySelector("meta[name='theme-color']").content = settings.theme === "light" ? "#F4F1EA" : "#14161B";
}

function renderSettings() {
  themeSetting.querySelectorAll("button").forEach(button => {
    button.classList.toggle("selected", button.dataset.themeOption === settings.theme);
  });
  smartVoicingToggle.checked = settings.smartVoicing;
  handSpanSetting.classList.toggle("disabled", !settings.smartVoicing);
  handSpanSetting.querySelectorAll("button").forEach(button => {
    button.classList.toggle("selected", parseInt(button.dataset.span) === settings.handSpan);
    button.disabled = !settings.smartVoicing;
  });
}

settingsButton.addEventListener("click", () => {
  renderSettings();
  openSheet(settingsSheet);
});

smartVoicingToggle.addEventListener("change", () => {
  settings.smartVoicing = smartVoicingToggle.checked;
  saveSettings();
  renderSettings();
  createKeyboard();
});

handSpanSetting.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    settings.handSpan = parseInt(button.dataset.span);
    saveSettings();
    renderSettings();
  });
});

themeSetting.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    settings.theme = button.dataset.themeOption;
    saveSettings();
    applyTheme();
    renderSettings();
  });
});

applyTheme();

document.getElementById("settings-done").addEventListener("click", () => closeSheet(settingsSheet));

//#endregion

//#region Keyboard

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];


function createKeyboard() {
    const instrument = document.getElementById("instrument-2");
    instrument.innerHTML = "";

    // Smart voicing needs room for a whole hand position, so it shows two octaves (C3-B4)
    const octaves = settings.smartVoicing ? 2 : 1;
    const firstKey = settings.smartVoicing ? voicingLow : middleC;

    let keyboard = document.createElement("div");
    for (let midi = firstKey; midi < firstKey + octaves * 12; midi++) {
        const note = keys[midi % 12];
        let key = document.createElement("div");
        key.classList.add("key");
        if (note.includes("#")) {
            key.classList.add("black-key");
        }
        key.textContent = note;
        key.dataset.note = note;
        key.dataset.midi = midi;
        keyboard.appendChild(key);
    }

    keyboard.classList.add("keyboard");
    keyboard.classList.toggle("wide", octaves > 1);
    instrument.appendChild(keyboard);
}

// progressionIndex: position in the post-transpose list, or undefined to preview a chord as if added next
const keysChord = document.getElementById("keys-chord");

function clearHighlight() {
    keysChord.textContent = "";
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("highlight", "highlight-original");
        delete key.dataset.finger;
    });
}

// Mark one chord's keys with className: its voicing when smart hand position is on, otherwise every matching note
function markChord(chordName, className, progression, progressionIndex, showFingers) {
    if (settings.smartVoicing) {
        const names = [...progression];
        if (progressionIndex === undefined) {
            names.push(chordName);
            progressionIndex = names.length - 1;
        }

        const voicing = voiceProgression(names)[progressionIndex];
        if (voicing) {
            voicing.keys.forEach((midi, i) => {
                const key = document.querySelector(`.key[data-midi='${midi}']`);
                key.classList.add(className);
                if (showFingers) {
                    key.dataset.finger = voicing.fingers[i];
                }
            });
            return;
        }
    }

    const notes = getChordNotes(chordName);
    if (notes) {
        notes.forEach(note => {
            document.querySelectorAll(`.key[data-note='${note}']`).forEach(el => el.classList.add(className));
        });
    } else {
        console.warn(`Chord not found: ${chordName}`);
    }
}

// Show one chord on the keys, coloured by its row ("original" blue, "transposed" amber).
// progressionIndex: position in the progression, or undefined to preview a chord as if added next
function showChord(chordName, progressionIndex, row) {
    clearHighlight();
    keysChord.textContent = chordName;
    keysChord.dataset.row = row;

    const isOriginal = row === "original";
    markChord(chordName, isOriginal ? "highlight-original" : "highlight",
        isOriginal ? getOriginals() : getProgression(), progressionIndex, true);
}

createKeyboard();

//#endregion
