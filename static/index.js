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

function handleZooming(buttons) {
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
}

function handlePanning(axes) {
  // right is positive
  const leftRightAxis = axes[0]
  // down is positive
  const upDownAxis = axes[1]

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

  const currentCenter = map.getCenter();
  let newCenter = null;

  if (upDownAxis === -1) {
    // stick up
    newCenter = [currentCenter.lat + step, currentCenter.lng];
  } else if (upDownAxis === 1) {
    // stick down
    newCenter = [currentCenter.lat - step, currentCenter.lng];
  } else if (leftRightAxis === -1) {
    // stick left
    newCenter = [currentCenter.lat, currentCenter.lng - step];
  } else if (leftRightAxis === 1) {
    // stick right
    newCenter = [currentCenter.lat, currentCenter.lng + step];
  }

  return newCenter;
}

function gameLoop() {
  if (controllerIndex !== null) {
    const gamepad = navigator.getGamepads()[controllerIndex];

    handleZooming(gamepad.buttons);
    const newCenter = handlePanning(gamepad.axes)
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
