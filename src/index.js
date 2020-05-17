// TODO: Handle exceptions
const cvReady = new Promise(resolve => {
  window.Module = { onRuntimeInitialized: resolve };
  window.cv = require('./img-proc/opencv');
});
