import { findSheetCorners, removeSheetPerspective } from './img-proc';

// TODO: Handle exceptions
const cvReady = new Promise(resolve => {
  window.Module = { onRuntimeInitialized: resolve };
  window.cv = require('./img-proc/opencv');
});

let stream;
const preview = document.getElementById('preview');
const captureBtn = document.getElementById('capture-btn');
const backBtn = document.getElementById('back-btn');
const downloadBtn = document.getElementById('download-btn');
const canvas = document.getElementById('canvas');
const loading = document.getElementById('loading');

const createImageFromBlob = blob => new Promise(resolve => {
  const image = new Image();
  const imageUrl = URL.createObjectURL(blob);
  image.onload = () => {
    URL.revokeObjectURL(imageUrl);
    resolve(image);
  };
  image.src = imageUrl;
});

captureBtn.addEventListener('click', async () => {
  try {
    loading.style.display = 'initial';
    captureBtn.style.display = 'none';
    preview.pause();
    const track = stream.getVideoTracks()[0];
    const picture = await (new ImageCapture(track)).takePhoto();
    const image = await createImageFromBlob(picture);
    await cvReady;
    const source = cv.imread(image);
    const corners = findSheetCorners(source);
    const sheet = removeSheetPerspective(source, corners);
    preview.style.display = 'none';
    loading.style.display = 'none';
    canvas.style.display = 'initial';
    backBtn.style.display = 'initial';
    downloadBtn.style.display = 'initial';
    cv.imshow(canvas, sheet);
    source.delete();
    sheet.delete();
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
});

backBtn.addEventListener('click', () => {
  preview.style.display = 'initial';
  canvas.style.display = 'none';
  captureBtn.style.display = 'initial';
  backBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
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
