import { Canvas, createCanvas, Image, loadImage, ImageData } from 'canvas';
import { writeFileSync, unlinkSync } from 'fs';
import { findSheetCorners, removeSheetPerspective } from '.';

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

function drawImage(image, outputFilename) {
  const canvas = createCanvas(image.cols, image.rows);
  cv.imshow(canvas, image);
  const filename = outputFilename || `test-output-${Date.now()}.jpeg`;
  writeFileSync(filename, canvas.toBuffer('image/jpeg'));
}

function drawPoints(image, points, outputFilename) {
  const color = new cv.Scalar(255, 0, 0, 255);
  points.forEach(({x, y}) => cv.circle(image, new cv.Point(x, y), 5, color, -1));
  drawImage(image, outputFilename);
}

function drawContour(image, contour, outputFilename) {
  const contours = new cv.MatVector();
  contours.push_back(contour);
  cv.drawContours(image, contours, 0, new cv.Scalar(0, 0, 0), 5);
  contours.delete();
  drawImage(image, outputFilename);
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

const testImageA = {
  image: `${__dirname}/test-img/test-image-a.jpeg`,
  corners: [ // top-left, top-right, bottom-right, bottom-left
    { x: 91, y: 43 },
    { x: 821, y: 39 },
    { x: 826, y: 1092 },
    { x: 83, y: 1071 },
  ],
  output: `${__dirname}/test-img/test-image-a-output.jpeg`,
};

const testImageB = {
  image: `${__dirname}/test-img/test-image-b.jpeg`,
  corners: [ // top-left, top-right, bottom-right, bottom-left
    { x: 151, y: 90 },
    { x: 746, y: 94 },
    { x: 846, y: 1025 },
    { x: 12, y: 991 },
  ],
  output: `${__dirname}/test-img/test-image-b-output.jpeg`,
};

describe('images compare', () => {
  let imageA, imageB;

  afterEach(() => {
    imageA.delete();
    imageB.delete();
  });

  it('images are equals', async () => {
    imageA = await readImage(testImageA.image);
    imageB = await readImage(testImageA.image);
    expect(areEquals(imageA, imageB)).toBe(true);
  });

  it('images are different', async () => {
    imageA = await readImage(testImageA.image);
    imageB = await readImage(testImageB.image);
    expect(areEquals(imageA, imageB)).toBe(false);
  });
});

describe('corners detection', () => {
  it('corners are correctly detected', async () => {
    const imageA = await readImage(testImageA.image);
    const imageB = await readImage(testImageB.image);
    const cornersA = findSheetCorners(imageA);
    const cornersB = findSheetCorners(imageB);

    const cornerDistanceTolerance = 5; // 5px
    cornersA.forEach((computedPoint, index) => {
      const realCorner = testImageA.corners[index];
      const pointsDistance = Math.hypot(computedPoint.x - realCorner.x, computedPoint.y - realCorner.y);
      expect(pointsDistance).toBeLessThan(cornerDistanceTolerance);
    });
    cornersB.forEach((computedPoint, index) => {
      const realCorner = testImageB.corners[index];
      const pointsDistance = Math.hypot(computedPoint.x - realCorner.x, computedPoint.y - realCorner.y);
      expect(pointsDistance).toBeLessThan(cornerDistanceTolerance);
    });

    expect.assertions(8); // 2 test images, 4 corners per image to verify, 1 assertion per corner

    if (process.env.DRAW_OUTPUT) {
      drawPoints(imageA, cornersA);
      drawPoints(imageB, cornersB);
    }
  });
});

// NOTE: When an image is saved, its properties change, so in order to compare
//       previous (saved) results with current ones, we have to write them
//       first and re-read them to compare with the previous results.
describe('remove sheet perspective', () => {
  it('perspective is removed successfully', async () => {
    const imageA = await readImage(testImageA.image);
    const validSheetA = await readImage(testImageA.output);
    const sheetA = removeSheetPerspective(imageA, testImageA.corners);
    const tmpSheetAFilename = `test-output-${Date.now()}.jpeg`;
    drawImage(sheetA, tmpSheetAFilename);
    const readSheetA = await readImage(tmpSheetAFilename);
    expect(areEquals(readSheetA, validSheetA)).toBe(true);

    const imageB = await readImage(testImageB.image);
    const validSheetB = await readImage(testImageB.output);
    const sheetB = removeSheetPerspective(imageB, testImageB.corners);
    const tmpSheetBFilename = `test-output-${Date.now()}.jpeg`;
    drawImage(sheetB, tmpSheetBFilename);
    const readSheetB = await readImage(tmpSheetBFilename);
    expect(areEquals(readSheetB, validSheetB)).toBe(true);

    if (!process.env.DRAW_OUTPUT) {
      unlinkSync(tmpSheetAFilename);
      unlinkSync(tmpSheetBFilename);
    }
  });
});
