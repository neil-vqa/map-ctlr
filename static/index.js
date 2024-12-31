function initMap() {
  map = L.map("map").setView([37.7749, -122.4194], 12); // San Francisco

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 40,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

let controllerIndex = null;
let isZoomingIn = false;
let isZoomingOut = false;

window.addEventListener("gamepadconnected", (event) => {
  const gamepad = event.gamepad;
  controllerIndex = gamepad.index;
  console.log("connected", gamepad.id);
});

window.addEventListener("gamepaddisconnected", (event) => {
  controllerIndex = null;
  console.log("disconnected");
});

function handleButtons(buttons) {
  const currentZoom = map.getZoom();

  let step;
  if (currentZoom > 19) {
    step = 0.00001;
  } else if (currentZoom > 16) {
    step = 0.0001;
  } else if (currentZoom > 12) {
    step = 0.001;
  } else if (currentZoom > 9) {
    step = 0.01;
  } else if (currentZoom > 6) {
    step = 0.1;
  } else {
    step = 1;
  }

  const dPadIdx = [12, 13, 14, 15];
  let newCenter = null;

  for (let i = 0; i < buttons.length; i++) {
    if (dPadIdx.includes(i) && buttons[i].pressed) {
      const currentCenter = map.getCenter();

      if (i === 12) {
        // D-pad up
        newCenter = [currentCenter.lat + step, currentCenter.lng];
      } else if (i === 13) {
        // D-pad down
        newCenter = [currentCenter.lat - step, currentCenter.lng];
      } else if (i === 14) {
        // D-pad left
        newCenter = [currentCenter.lat, currentCenter.lng - step];
      } else if (i === 15) {
        // D-pad right
        newCenter = [currentCenter.lat, currentCenter.lng + step];
      }
    }
  }

  // Handle zoom buttons
  if (buttons[1].pressed && !isZoomingOut) {
    // 'B' button for zoom out
    map.zoomOut();
    isZoomingOut = true;
  } else if (!buttons[1].pressed) {
    isZoomingOut = false;
  }

  if (buttons[0].pressed && !isZoomingIn) {
    // 'A' button for zoom in
    map.zoomIn();
    isZoomingIn = true;
  } else if (!buttons[0].pressed) {
    isZoomingIn = false;
  }

  return newCenter;
}

function gameLoop() {
  if (controllerIndex !== null) {
    const gamepad = navigator.getGamepads()[controllerIndex];

    const newCenter = handleButtons(gamepad.buttons);
    if (newCenter) {
      map.panTo(newCenter, { animate: false });
    }
  }

  requestAnimationFrame(gameLoop);
}

window.onload = function () {
  initMap();
  gameLoop();
};
