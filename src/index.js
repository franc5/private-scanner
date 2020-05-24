import { findSheetCorners } from './img-proc';
import { createImageFromBlob } from './utils';
import { drawCorners, hideCanvas } from './canvas';

// TODO: Handle exceptions
const cvReady = new Promise(resolve => {
  window.Module = { onRuntimeInitialized: resolve };
  window.cv = require('./img-proc/opencv');
});

let stream;
const preview = document.getElementById('preview');
const captureBtn = document.getElementById('capture-btn');
captureBtn.addEventListener('click', showPictureAndCorners);
const backBtn = document.getElementById('back-btn');
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');
const picture = document.getElementById('picture-canvas');

async function showPictureAndCorners() {
  try {
    loading.style.display = 'initial';
    captureBtn.style.display = 'none';
    preview.pause();
    const track = stream.getVideoTracks()[0];
    const photo = await (new ImageCapture(track)).takePhoto();
    const image = await createImageFromBlob(photo);
    await cvReady;
    const source = cv.imread(image);
    cv.imshow(picture, source);
    const corners = findSheetCorners(source);
    picture.style.display = 'initial';
    preview.style.display = 'none';
    loading.style.display = 'none';
    backBtn.style.display = 'initial';
    drawCorners(corners, source.cols, source.rows);
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
  preview.play();
});

downloadBtn.addEventListener('click', () => {
  // TODO: Rethink this implementation
  const downloadLink = document.createElement('a');
  downloadLink.download = `${Date.now()}.png`;
  downloadLink.href = picture.toDataURL();
  downloadLink.click();
});

async function initCameraPreview() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: {
      facingMode: { exact: 'environment' },
    }});
    preview.srcObject = stream;
    preview.play();
  } catch(error) {
    // TODO: Handle exceptions (NotAllowedError | NotFoundError)
    console.error(error);
  }
}

initCameraPreview();
