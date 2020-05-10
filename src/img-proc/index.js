// TODO: Investigate a way to automatically set the threshold and ratio based on the image
function detectEdges(image, threshold, ratio) {
  const output = new cv.Mat();
  cv.cvtColor(image, output, cv.COLOR_RGBA2GRAY);
  cv.Canny(output, output, threshold, ratio * threshold);
  return output;
}

function findLargestContour(edges) {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  hierarchy.delete();

  let largestContourIdx = 0;
  let largestContourPerimeter = -1;
  for (let i = 0; i < contours.size(); i++) {
    const contourPerimeter = cv.arcLength(contours.get(i), true);
    if (contourPerimeter > largestContourPerimeter) {
      largestContourIdx = i;
      largestContourPerimeter = contourPerimeter;
    }
  }
  const largestContour = contours.get(largestContourIdx);
  contours.delete();

  return largestContour;
}

function approximateCurve(curve, maxIterations = 25) {
  if (curve.rows < 4) {
    throw new Error("Invalid curve");
  }

  if (curve.rows === 4) {
    return curve;
  }

  let iterations = 0;
  const curveHull = new cv.Mat();
  cv.convexHull(curve, curveHull);
  const approximatedCurve = new cv.Mat();
  let epsilon = 0.02 * cv.arcLength(curveHull, true);

  while (approximatedCurve.rows !== 4 && iterations < maxIterations) {
    cv.approxPolyDP(curveHull, approximatedCurve, epsilon, true);
    (approximatedCurve.rows < 4) ? epsilon *= 0.8 : epsilon *= 1.2;
    iterations++;
  }

  if (approximatedCurve.rows !== 4) {
    throw new Error("Cannot approximate curve");
  }

  return approximatedCurve;
}

function getCurvePoints(curve) {
  const points = [];
  for (let i = 0; i < curve.rows; i++) {
    points.push({
      x: curve.data32S[i*2],
      y: curve.data32S[i*2+1],
    });
  }

  return points;
}

// Sort corners of the sheet: [top-left, top-right, bottom-right, bottom-left]
// Normal situations are assumed to sort the corners
function sortCorners(corners) {
  const sortedCorners = [...corners];
  sortedCorners.sort((pointA, pointB) => pointA.y - pointB.y);
  if (sortedCorners[0].x > sortedCorners[1].x) {
    const topLeft = sortedCorners[1];
    sortedCorners[1] = sortedCorners[0];
    sortedCorners[0] = topLeft;
  }
  if (sortedCorners[3].x > sortedCorners[2].x) {
    const bottomLeft = sortedCorners[2];
    sortedCorners[2] = sortedCorners[3];
    sortedCorners[3] = bottomLeft;
  }
  return sortedCorners;
}

export function findSheetCorners(image, threshold = 200, ratio = 2) {
  const edges = detectEdges(image, threshold, ratio);
  const largestContour = findLargestContour(edges);
  edges.delete();
  const smoothContour = approximateCurve(largestContour);
  largestContour.delete();
  const corners = getCurvePoints(smoothContour);
  smoothContour.delete();
  const sortedCorners = sortCorners(corners);

  return sortedCorners;
}

// Corners must be sorted: [top-left, top-right, bottom-right, bottom-left]
export function removeSheetPerspective(image, corners) {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;

  const roiOffsetX = Math.min(topLeft.x, bottomLeft.x);
  const roiOffsetY = Math.min(topLeft.y, topRight.y);
  const roi = {
    x: roiOffsetX,
    y: roiOffsetY,
    width: Math.max(topRight.x, bottomRight.x) - roiOffsetX,
    height: Math.max(bottomLeft.y, bottomRight.y) - roiOffsetY,
  };
  const roiImage = image.roi(roi);

  const originalPerspective = cv.matFromArray(4, 1, cv.CV_32FC2, [
    topLeft.x - roiOffsetX, topLeft.y - roiOffsetY,
    topRight.x - roiOffsetX, topRight.y - roiOffsetY,
    bottomRight.x - roiOffsetX, bottomRight.y - roiOffsetY,
    bottomLeft.x - roiOffsetX, bottomLeft.y - roiOffsetY,
  ]);
  const noPerspective = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    roi.width, 0,
    roi.width, roi.height,
    0, roi.height,
  ]);
  const transformationMatrix = cv.getPerspectiveTransform(originalPerspective, noPerspective);

  const noPerspectiveRoiImage = new cv.Mat();
  cv.warpPerspective(roiImage, noPerspectiveRoiImage, transformationMatrix, roiImage.size());
  roiImage.delete();
  transformationMatrix.delete();
  return noPerspectiveRoiImage;
}
