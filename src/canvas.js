const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cornerIndicatorRadius = 15;

let corners, normalizeToCanvas;

/**
 * Returns a function which takes a point (coordinates `x` and `y`) from the original image and returns
 * the corresponding point in the canvas (by normalizing the size difference between the image and the canvas)
 */
const getToCanvasNormalizer = (pictureWidth, pictureHeight, canvasWidth, canvasHeight) => (x, y) => ({
  x: Math.round(x * canvasWidth / pictureWidth),
  y: Math.round(y * canvasHeight / pictureHeight),
});

function drawCornersInCanvas() {
  if (!corners || !corners.length) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  corners.forEach(({ x: imageX, y: imageY }) => {
    ctx.beginPath();
    const { x: canvasX, y: canvasY } = normalizeToCanvas(imageX, imageY);
    ctx.arc(canvasX, canvasY, cornerIndicatorRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  });
}

export function drawCorners(detectedCorners, pictureWidth, pictureHeight) {
  corners = [...detectedCorners];
  canvas.style.display = 'initial';
  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollHeight;
  ctx.fillStyle = '#1E88E5';
  normalizeToCanvas = getToCanvasNormalizer(pictureWidth, pictureHeight, canvas.width, canvas.height);

  drawCornersInCanvas();
}

export function hideCanvas() {
  canvas.style.display = 'none';
}
