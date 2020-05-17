// TODO: Handle exceptions
const cvReady = new Promise(resolve => {
  window.Module = { onRuntimeInitialized: resolve };
  window.cv = require('./img-proc/opencv');
});

let stream;
const preview = document.getElementById('preview');

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
