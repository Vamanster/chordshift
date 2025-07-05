if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/chordshift/service-worker.js')
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
  
  // Helper function to get the root note and its accidental (e.g., 'C#', 'Db')
  function getRootNote(chord) {
    const regex = /^([A-Ga-g]+)([#b]*)/; // Match root note (e.g., "C", "Db", "D#")
    const match = chord.match(regex);
    return match ? match[0] : null;
  }

  // Helper function to get the chord's modifiers (e.g., 'm', 'maj7', '7')
  function getModifiers(chord) {
    const regex = /([a-zA-Z0-9]+)/g; 
    const match = chord.match(regex);
    return match && match.length > 1 ? match.slice(1).join('') : '';
  }

  // Get the root note and the modifiers from the chord
  const rootNote = getRootNote(chord);
  const modifiers = getModifiers(chord);
  
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

const preTranspose = document.getElementById("pre-transpose");
const postTranspose = document.getElementById("post-transpose");
const transposeAmountText = document.getElementById("transpose-amount");

let transposeAmount = 0;

function updateTranspose() {
  postTranspose.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute("chord")) {
      const baseChord = node.getAttribute("chord").toString();
      const result = transposeChord(baseChord, transposeAmount);
      node.textContent = result;
    }
  });

  transposeAmountText.textContent = transposeAmount;
}

//#endregion

//#region Fretboard

const instrument_1 = document.getElementById("instrument-1");
let frets = document.querySelectorAll(".fret");

// Function to change color if the touch is inside the div
function checkHovers(event) {
  const touch = event.touches[0]; // Get the first touch point

  frets.forEach(fret => {
    const rect = fret.getBoundingClientRect(); // Get the div's position and size
    // Check if the touch is inside the div
    const isTouchInside = touch.clientX >= rect.left && touch.clientX <= rect.right &&
    touch.clientY >= rect.top && touch.clientY <= rect.bottom;

    if (isTouchInside) {
      fret.classList.add("hovered");
      transposeAmount = parseInt(fret.getAttribute("fret-number"));
    }
    else {
      fret.classList.remove("hovered");
    }
  });
}

instrument_1.addEventListener("touchmove", (event) => checkHovers(event));
instrument_1.addEventListener("touchend", () => {
  updateTranspose();
});

for (let i = 0; i < 12; i++) {
  const fret = document.createElement("div");
  fret.classList.add("fret");
  fret.style.width = `calc(${i}px + 5vw)`;
  fret.style.height = `calc(${6 - (i / 2)}px + 8vh)`;
  fret.setAttribute("fret-number", 12 - i);
  switch (12 - i) {
    case 3:
      fret.textContent = "○"
      break;
    case 5:
      fret.textContent = "○"
      break;
    case 7:
      fret.textContent = "○"
      break;
    case 9:
      fret.textContent = "○"
      break;
    case 12:
      fret.innerHTML = "◌<br/><br/>◌"
      break;
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

const chordLists = [fifths, sevenths, aug, dim, m7, maj, maj7, sus2, sus4];

function getChordNotes(chordName) {
  
}

//#endregion

//#region Chords picker

const chordButtons = document.querySelectorAll(".chord-button");

let activeButton = null;

chordButtons.forEach(button => {
  const chordSelector = button.querySelector(".chord-selector");
  chordSelector.classList.add("hidden");

  const buttonChordName = button.getAttribute("chord") || button.textContent.trim(); // e.g., "A", "C#"
  const root = buttonChordName.replace(/[^A-G#]/g, ''); // Extract root note

  // Loop through all chord lists
  chordLists.forEach(chordList => {
    Object.keys(chordList).forEach(chordName => {
      if (chordName.startsWith(root)) {
        const chordDiv = document.createElement("div");
        chordDiv.className = "selector-option";
        chordDiv.textContent = chordName;
        chordSelector.appendChild(chordDiv);
      }
    })
  });

  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    chordSelector.classList.remove("hidden");
    activeButton = button;
  });
});

// Add only one touchend listener
document.addEventListener("touchend", (e) => {
  if (!activeButton) return;

  const chordSelector = activeButton.querySelector(".chord-selector");
  if (!chordSelector) return;

  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);

  if (chordSelector.contains(target)) {
    const newChord = target.textContent;
    if (target.matches(".some-option")) {
      console.log("User selected option:", newChord);
    }
    activeButton.setAttribute("chord", newChord);
    activeButton.querySelector(".chord-text").textContent = newChord;

    highlightChord(newChord);
  }
  else
  {
    const newChord = activeButton.getAttribute("chord");

    console.log("ADD CHORD: " + newChord);
    
    const button = document.createElement("buton");
    button.setAttribute("chord", newChord);
    button.setAttribute("type", "button");
    button.classList.add("pre-chord-button");
    button.textContent = newChord;

    button.addEventListener("click", () => {
      const index = Array.from(preTranspose.children).indexOf(button) + 1;
      preTranspose.childNodes[index].remove();
      postTranspose.childNodes[index].remove();
    });

    const postButton = button.cloneNode(true);
    postTranspose.appendChild(postButton);

    preTranspose.appendChild(button);
  }

  chordSelector.classList.add("hidden");
  activeButton = null;

  updateTranspose();
});

// chordButtons.forEach(button => {
//   button.addEventListener("click", () => {
//     const chord = button.getAttribute("chord");

//     const preButton = button.cloneNode(true);
//     preTranspose.appendChild(preButton);

//     const postButton = button.cloneNode(true);
//     postTranspose.appendChild(postButton);

//     preButton.addEventListener("click", () => {
//       const index = Array.from(preTranspose.children).indexOf(preButton) + 1;
//       preTranspose.childNodes[index].remove();
//       postTranspose.childNodes[index].remove();
//     });

//     postButton.addEventListener("click", () => {
//       highlightChord(postButton.textContent);

//       postButton.classList.add("highlight");
//       setTimeout(() => {
//         postButton.classList.remove("highlight");
//       }, 1000);
//     });

//     updateTranspose();
//   });
// });


//#endregion

//#region Keyboard

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const majorChords = {
  "C": ["C", "E", "G"],
  "C#": ["C#", "F", "G#"],
  "D": ["D", "F#", "A"],
  "D#": ["D#", "G", "A#"],
  "E": ["E", "G#", "B"],
  "F": ["F", "A", "C"],
  "F#": ["F#", "A#", "C#"],
  "G": ["G", "B", "D"],
  "G#": ["G#", "C", "D#"],
  "A": ["A", "C#", "E"],
  "A#": ["A#", "D", "F"],
  "B": ["B", "D#", "F#"],
  "Am": ["A", "C", "E"],
  "A#m": ["A#", "C#", "F"],
  "Bm": ["B", "D", "F#"],
  "Cm": ["C", "D#", "G"],
  "C#m": ["C#", "E", "G#"],
  "Dm": ["D", "F", "A"],
  "D#m": ["D#", "F#", "A#"],
  "Em": ["E", "G", "B"],
  "Fm": ["F", "G#", "C"],
  "F#m": ["F#", "A", "C#"],
  "Gm": ["G", "A#", "D"],
  "G#m": ["G#", "B", "D#"]
};

function createKeyboard() {
    const instrument = document.getElementById("instrument-2");
    let keyboard = document.createElement("div");
    keys.forEach(note => {
        let key = document.createElement("div");
        key.classList.add("key");
        if (note.includes("#")) {
            key.classList.add("black-key");
        }
        key.textContent = note;
        key.dataset.note = note;
        keyboard.appendChild(key);
    });

    keyboard.classList.add("keyboard");
    instrument.appendChild(keyboard);
}

function highlightChord(chordName) {
    let keysToHighlight = null;

    // Search in all chord dictionaries
    for (const dict of chordLists) {
        if (dict[chordName]) {
            keysToHighlight = dict[chordName];
            break;
        }
    }

    // Remove existing highlights
    document.querySelectorAll(".key").forEach(key => key.classList.remove("highlight"));

    // Add highlights if the chord was found
    if (keysToHighlight) {
        keysToHighlight.forEach(note => {
            document.querySelectorAll(`[data-note='${note}']`).forEach(el => el.classList.add("highlight"));
        });
    } else {
        console.warn(`Chord not found: ${chordName}`);
    }
}

createKeyboard();

//#endregion

