import { Image, loadImage } from 'canvas';

async function readImage(path) {
  const image = await loadImage(path);
  const mat = cv.imread(image);
  return mat;
}

function areEquals(imageA, imageB) {
  if (imageA.rows !== imageB.rows ||
      imageA.cols !== imageB.cols ||
      imageA.type() !== imageB.type()) {
    return false;
  }

  const diff = new cv.Mat();
  cv.absdiff(imageA, imageB, diff);
  const diffChannels = new cv.MatVector();
  cv.split(diff, diffChannels);
  diff.delete();

  let equals = true;
  for (let i = 0; i < diffChannels.size(); i++) {
    const isChannelEqual = cv.countNonZero(diffChannels.get(i)) === 0;
    if (!isChannelEqual) {
      equals = false;
      break;
    }
  }
  diffChannels.delete();

  return equals;
}

beforeAll(async () => {
  global.HTMLImageElement = Image;

  await new Promise(resolve => {
    global.Module = {
      onRuntimeInitialized: resolve,
    };
    global.cv = require('./opencv.js');
  });
});

const testImageA = `${__dirname}/test-img/test-image-a.jpeg`;
const testImageB = `${__dirname}/test-img/test-image-b.jpeg`;

describe('images compare', () => {
  let imageA, imageB;

  afterEach(() => {
    imageA.delete();
    imageB.delete();
  });

  it('images are equals', async () => {
    imageA = await readImage(testImageA);
    imageB = await readImage(testImageA);
    expect(areEquals(imageA, imageB)).toBe(true);
  });

  it('images are different', async () => {
    imageA = await readImage(testImageA);
    imageB = await readImage(testImageB);
    expect(areEquals(imageA, imageB)).toBe(false);
  });
});
