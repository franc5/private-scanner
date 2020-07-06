const canvas = document.getElementById('corners-canvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener('touchstart', detectSelectedCorner);
canvas.addEventListener('touchmove', moveSelectedCorner);
canvas.addEventListener('touchcancel', deselectCorner);
canvas.addEventListener('touchend', deselectCorner);
const cornerIndicatorRadius = 15;
const cornerTouchableRadius = 56;

let corners, cornerBeingMoved;

function normalizeCanvasTouchToImage({ clientX, clientY }) {
  return {
    x: Math.round((clientX - canvas.offsetLeft) * canvas.width / canvas.scrollWidth),
    y: Math.round((clientY - canvas.offsetTop) * canvas.height / canvas.scrollHeight),
  };
}

function detectSelectedCorner(event) {
  cornerBeingMoved = null;
  const { x: imageX, y: imageY } = normalizeCanvasTouchToImage(event.targetTouches[0]);

  corners.some(({ x, y }, cornerIndex) => {
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

  corners[cornerBeingMoved] = normalizeCanvasTouchToImage(event.targetTouches[0]);
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
  corners.forEach(({ x, y }) => ctx.arc(x, y, 0, 0, 0));
  ctx.fill();
  ctx.closePath();

  // Draw a circle centered in each corner (filled for the selected corner -if any-)
  corners.forEach(({ x: imageX, y: imageY }, index) => {
    ctx.beginPath();
    ctx.arc(imageX, imageY, cornerIndicatorRadius, 0, 2 * Math.PI);
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
  canvas.width = pictureWidth;
  canvas.height = pictureHeight;
  ctx.fillStyle = '#1E88E588';
  ctx.strokeStyle = '#1E88E5';

  drawCornersInCanvas();
}

export function getCorners() {
  return corners;
}

export function hideCanvas() {
  canvas.style.display = 'none';
}
