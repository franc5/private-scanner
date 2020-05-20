import { findSheetCorners, removeSheetPerspective } from './img-proc';

// TODO: Handle exceptions
const cvReady = new Promise(resolve => {
  window.Module = { onRuntimeInitialized: resolve };
  window.cv = require('./img-proc/opencv');
});

let stream;
const preview = document.getElementById('preview');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('canvas');

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
    preview.pause();
    const track = stream.getVideoTracks()[0];
    const picture = await (new ImageCapture(track)).takePhoto();
    const image = await createImageFromBlob(picture);
    await cvReady;
    const source = cv.imread(image);
    const corners = findSheetCorners(source);
    const sheet = removeSheetPerspective(source, corners);
    preview.style.display = 'none';
    canvas.style.display = 'inherit';
    cv.imshow(canvas, sheet);
    source.delete();
    sheet.delete();
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
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
