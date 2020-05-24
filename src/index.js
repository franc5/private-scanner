import { findSheetCorners } from './img-proc';
import { loadBlobPhotoIntoTargetImg } from './utils';

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
const canvas = document.getElementById('canvas');
const loading = document.getElementById('loading');
const picture = document.getElementById('picture');

async function showPictureAndCorners() {
  try {
    loading.style.display = 'initial';
    captureBtn.style.display = 'none';
    preview.pause();
    const track = stream.getVideoTracks()[0];
    const photo = await (new ImageCapture(track)).takePhoto();
    await loadBlobPhotoIntoTargetImg(picture, photo);
    await cvReady;
    const source = cv.imread(picture);
    const corners = findSheetCorners(source);
    // TODO: Draw corners
    picture.style.display = 'initial';
    preview.style.display = 'none';
    loading.style.display = 'none';
    backBtn.style.display = 'initial';
    source.delete();
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
}

backBtn.addEventListener('click', () => {
  preview.style.display = 'initial';
  picture.style.display = 'none';
  captureBtn.style.display = 'initial';
  backBtn.style.display = 'none';
  preview.play();
});

downloadBtn.addEventListener('click', () => {
  const downloadLink = document.createElement('a');
  downloadLink.download = `${Date.now()}.png`;
  downloadLink.href = canvas.toDataURL();
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
