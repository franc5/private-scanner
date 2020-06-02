# Classes and methods whitelist to build opencv.js
# This list includes the methods used in the app
core = {'': ['absdiff', 'countNonZero', 'split'], 'Algorithm': []}

imgproc = {'': ['Canny', 'approxPolyDP', 'arcLength', 'convexHull', 'cvtColor',
                'drawContours', 'findContours', 'getPerspectiveTransform', 'resize', 'warpPerspective'],
           'CLAHE': []}

white_list = makeWhiteList([core, imgproc])
