import { findSheetCorners, removeSheetPerspective } from './img-proc';
import { drawCorners, getCorners, hideCanvas } from './corners-canvas';

// TODO: Handle exceptions
const cvReady = new Promise(resolve => {
  // The OpenCV module is requested once the app is
  // fully loaded and the camera preview is ready.
  window.Module = { onRuntimeInitialized: resolve };
});

const preview = document.getElementById('preview');
const captureBtn = document.getElementById('capture-btn');
captureBtn.addEventListener('click', showPictureAndCorners);
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
nextBtn.addEventListener('click', applyPerspectiveTransformation);
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');
const picture = document.getElementById('picture-canvas');

async function showPictureAndCorners() {
  try {
    loading.style.display = 'initial';
    captureBtn.style.display = 'none';
    preview.pause();
    picture.style.display = 'initial';
    picture.width = picture.scrollWidth;
    picture.height = picture.scrollHeight;
    const ctx = picture.getContext('2d');
    ctx.drawImage(preview, 0, 0, picture.width, picture.height);
    preview.style.display = 'none';
    await cvReady;
    const source = cv.imread(picture);
    const corners = findSheetCorners(source);
    drawCorners(corners, source.cols, source.rows);
    loading.style.display = 'none';
    nextBtn.style.display = 'initial';
    backBtn.style.display = 'initial';
    source.delete();
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
}

backBtn.addEventListener('click', () => {
  hideCanvas();
  preview.style.display = 'initial';
  picture.style.display = 'none';
  captureBtn.style.display = 'initial';
  backBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  preview.play();
});

function applyPerspectiveTransformation() {
  try {
    loading.style.display = 'initial';
    nextBtn.style.display = 'none';
    backBtn.style.display = 'none';
    const corners = getCorners();
    hideCanvas();
    const source = cv.imread(picture);
    const result = removeSheetPerspective(source, corners);
    cv.imshow(picture, result);
    loading.style.display = 'none';
    backBtn.style.display = 'initial';
    downloadBtn.style.display = 'initial';
    source.delete();
    result.delete();
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
}

downloadBtn.addEventListener('click', () => {
  // TODO: Rethink this implementation
  const downloadLink = document.createElement('a');
  downloadLink.download = `${Date.now()}.png`;
  downloadLink.href = picture.toDataURL();
  downloadLink.click();
});

async function initCameraPreview() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {
      facingMode: { exact: 'environment' },
    }});
    preview.srcObject = stream;
    preview.play();
  } catch(error) {
    // TODO: Handle exceptions (NotAllowedError | NotFoundError)
    console.error(error);
  }
}

// TODO: Handle exceptions
initCameraPreview()
  .then(() => import('./load-opencv'));
