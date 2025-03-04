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
  fret.setAttribute("fret-number", 12 - i);
  instrument_1.appendChild(fret);
}

frets = document.querySelectorAll(".fret");

// #endregion

//#region Chords picker

const chordButtons = document.querySelectorAll(".chord-button");

chordButtons.forEach(button => {
  button.addEventListener("click", () => {
    const chord = button.getAttribute("chord");

    const preButton = button.cloneNode(true);
    preTranspose.appendChild(preButton);

    const postButton = button.cloneNode(true);
    postTranspose.appendChild(postButton);

    preButton.addEventListener("click", () => {
      const index = Array.from(preTranspose.children).indexOf(preButton) + 1;
      preTranspose.childNodes[index].remove();
      postTranspose.childNodes[index].remove();
    });

    postButton.addEventListener("click", () => {
      highlightChord(postButton.textContent);

      postButton.classList.add("highlight");
      setTimeout(() => {
        postButton.classList.remove("highlight");
      }, 1000);
    });

    updateTranspose();
  });
});


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
    let keysToHighlight = majorChords[chordName];
    document.querySelectorAll(".key").forEach(key => key.classList.remove("highlight"));
    if (keysToHighlight) {
        keysToHighlight.forEach(note => {
            document.querySelectorAll(`[data-note='${note}']`).forEach(el => el.classList.add("highlight"));
        });
    }
}

createKeyboard();

//#endregion

