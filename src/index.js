import { computeAndDrawCorners, removePerspective, getCanvas, hideCanvas } from './canvas';
import jsPDF from 'jspdf';

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
downloadBtn.addEventListener('click', createAndDownloadPdf);

const loading = document.getElementById('loading');

async function showPictureAndCorners() {
  try {
    loading.style.display = 'initial';
    captureBtn.style.display = 'none';
    preview.pause();
    await cvReady;
    computeAndDrawCorners();
    loading.style.display = 'none';
    nextBtn.style.display = 'initial';
    backBtn.style.display = 'initial';
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
}

backBtn.addEventListener('click', () => {
  hideCanvas();
  preview.style.display = 'initial';
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
    removePerspective();
    preview.style.display = 'none';
    loading.style.display = 'none';
    backBtn.style.display = 'initial';
    downloadBtn.style.display = 'initial';
  } catch(error) {
    // TODO: Handle exceptions
    console.error(error);
  }
}

function createAndDownloadImage() {
  // TODO: Rethink this implementation
  const picture = getCanvas();
  const downloadLink = document.createElement('a');
  downloadLink.download = `${Date.now()}.png`;
  downloadLink.href = picture.toDataURL();
  downloadLink.click();
}

const A4mm = { width: 210, height: 297 };
function createAndDownloadPdf() {
  const picture = getCanvas();
  const pdf = new jsPDF();
  pdf.addImage(picture, 'JPEG', 0, 0, A4mm.width, A4mm.height, '', 'NONE');
  pdf.save(`${Date.now()}.pdf`);
}

(async function initApp() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {
      facingMode: { exact: 'environment' },
    }});
    preview.srcObject = stream;
    preview.play();
    await import('./load-opencv');
  } catch(error) {
    // TODO: Handle exceptions (NotAllowedError | NotFoundError)
    console.error(error);
  }
})();
