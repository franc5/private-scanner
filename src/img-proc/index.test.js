import { Canvas, createCanvas, Image, loadImage, ImageData } from 'canvas';
import { writeFileSync } from 'fs';
import { findSheetCorners } from '.';

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

function drawPoints(image, points, outputFilename) {
  const color = new cv.Scalar(255, 0, 0, 255);
  const canvas = createCanvas(image.cols, image.rows);
  points.forEach(({x, y}) => cv.circle(image, new cv.Point(x, y), 5, color, -1));
  cv.imshow(canvas, image);
  const filename = outputFilename || `test-output-${Date.now()}.jpeg`;
  writeFileSync(filename, canvas.toBuffer('image/jpeg'));
}

function drawContour(image, contour, outputFilename) {
  const canvas = createCanvas(image.cols, image.rows);
  const contours = new cv.MatVector();
  contours.push_back(contour);
  cv.drawContours(image, contours, 0, new cv.Scalar(0, 0, 0), 5);
  contours.delete();
  cv.imshow(canvas, image);
  const filename = outputFilename || `test-output-${Date.now()}.jpeg`;
  writeFileSync(filename, canvas.toBuffer('image/jpeg'));
}

beforeAll(async () => {
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
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

// TODO: Improve tests
describe('corners detection', () => {
  it('corners cannot be detected', async () => {
    const imageA = await readImage(testImageA);
    expect(() => findSheetCorners(imageA)).toThrow("Cannot approximate curve");
  });

  it('corners are detected', async () => {
    const imageB = await readImage(testImageB);
    const cornersB = findSheetCorners(imageB);

    if (process.env.DRAW_OUTPUT) {
      drawPoints(imageB, cornersB);
    }
  });
});
