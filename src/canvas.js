const canvas = document.getElementById('corners-canvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener('touchstart', detectSelectedCorner);
canvas.addEventListener('touchmove', moveSelectedCorner);
canvas.addEventListener('touchcancel', deselectCorner);
canvas.addEventListener('touchend', deselectCorner);
const cornerIndicatorRadius = 15;
const cornerTouchableRadius = 56;

let corners, cornerBeingMoved, normalizeToCanvas, normalizeCanvasTouchToImage;

/**
 * Returns a function which takes a point (coordinates `x` and `y`) from the original image and returns
 * the corresponding point in the canvas (by normalizing the size difference between the image and the canvas)
 */
const getToCanvasNormalizer = (pictureWidth, pictureHeight, canvasWidth, canvasHeight) => (x, y) => ({
  x: Math.round(x * canvasWidth / pictureWidth),
  y: Math.round(y * canvasHeight / pictureHeight),
});

/**
 * Returns a function which takes a point (coordinates `x` and `y`) from the canvas and returns
 * the corresponding point in the image (by normalizing the size difference between the canvas and the image)
 * This function accepts two optionals parameters, `canvasOffsetX` and `canvasOffsetY`, to compensate the x-offset
 * and/or the y-offset of the canvas if needed
 */
const getToImageNormalizer = (pictureWidth, pictureHeight, canvasWidth, canvasHeight, canvasOffsetX = 0, canvasOffsetY = 0) => (x, y) => ({
  x: Math.round((x - canvasOffsetX) * pictureWidth / canvasWidth),
  y: Math.round((y - canvasOffsetY) * pictureHeight / canvasHeight),
});

function detectSelectedCorner(event) {
  cornerBeingMoved = null;
  const { clientX, clientY } = event.targetTouches[0];
  const { x: imageX, y: imageY } = normalizeCanvasTouchToImage(clientX, clientY);

  corners.some(({x, y}, cornerIndex) => {
    const distanceToCorner = Math.hypot(x - imageX, y - imageY);
    if (distanceToCorner < cornerTouchableRadius) {
      cornerBeingMoved = cornerIndex;
      drawCornersInCanvas();
      return true;
    }
  });
}

function moveSelectedCorner(event) {
  if (cornerBeingMoved === null) return;

  const { clientX, clientY } = event.targetTouches[0];
  const { x: imageX, y: imageY } = normalizeCanvasTouchToImage(clientX, clientY);
  corners[cornerBeingMoved] = {
    x: imageX,
    y: imageY,
  };
  drawCornersInCanvas();
}

function deselectCorner() {
  cornerBeingMoved = null;
  drawCornersInCanvas();
}

function drawCornersInCanvas() {
  if (!corners || !corners.length) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a transparent blue layer over the detected sheet
  ctx.beginPath();
  corners.forEach(({ x: imageX, y: imageY }) => {
    const { x: canvasX, y: canvasY } = normalizeToCanvas(imageX, imageY);
    ctx.arc(canvasX, canvasY, 0, 0, 0);
  });
  ctx.fill();
  ctx.closePath();

  // Draw a circle centered in each corner (filled for the selected corner -if any-)
  corners.forEach(({ x: imageX, y: imageY }, index) => {
    const { x: canvasX, y: canvasY } = normalizeToCanvas(imageX, imageY);
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, cornerIndicatorRadius, 0, 2 * Math.PI);
    if (index == cornerBeingMoved) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
    ctx.closePath();
  });
}

export function drawCorners(detectedCorners, pictureWidth, pictureHeight) {
  corners = [...detectedCorners];
  canvas.style.display = 'initial';
  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollHeight;
  normalizeToCanvas = getToCanvasNormalizer(pictureWidth, pictureHeight, canvas.width, canvas.height);
  normalizeCanvasTouchToImage = getToImageNormalizer(pictureWidth, pictureHeight, canvas.width, canvas.height, canvas.offsetLeft, canvas.offsetTop);
  ctx.fillStyle = '#1E88E588';
  ctx.strokeStyle = '#1E88E5';

  drawCornersInCanvas();
}

export function hideCanvas() {
  canvas.style.display = 'none';
}
