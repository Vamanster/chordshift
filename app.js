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
    }
    else {
      fret.classList.remove("hovered");
    }
  });
}

instrument_1.addEventListener("touchmove", (event) => checkHovers(event));

for (let i = 0; i < 12; i++) {
  const fret = document.createElement("div");
  fret.classList.add("fret");
  fret.style.width = `calc(${i}px + 5vw)`;
  instrument_1.appendChild(fret);
}

frets = document.querySelectorAll(".fret");