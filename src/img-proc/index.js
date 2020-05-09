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

// TODO: Improve curve approximation
function approximateCurve(curve, maxIterations = 25) {
  if (curve.rows < 4) {
    throw new Error("Invalid curve");
  }

  if (curve.rows === 4) {
    return curve;
  }

  let iterations = 0;
  const approximatedCurve = new cv.Mat();
  let epsilon = 0.02 * cv.arcLength(curve, true);

  while (approximatedCurve.rows !== 4 && iterations < maxIterations) {
    cv.approxPolyDP(curve, approximatedCurve, epsilon, true);
    if (approximatedCurve.rows === 4) {
      break;
    }

    (approximatedCurve.rows < 4) ? epsilon *= 0.8 : epsilon *= 1.2;
    iterations++;
  }

  if (approximatedCurve.rows !== 4) {
    throw new Error("Cannot approximate curve");
  }

  return approximatedCurve;
}

// TODO: Extract points from `corners`
export function findSheetCorners(image, threshold = 200, ratio = 2) {
  const edges = detectEdges(image, threshold, ratio);
  const contour = findLargestContour(edges);
  edges.delete();
  const corners = approximateCurve(contour);
  contour.delete();

  return corners;
}
