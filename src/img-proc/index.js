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

// TODO: Extract corners from `contour`
export function findSheetCorners(image, threshold = 200, ratio = 2) {
  const edges = detectEdges(image, threshold, ratio);
  const contour = findLargestContour(edges);
  edges.delete();

  return contour;
}
