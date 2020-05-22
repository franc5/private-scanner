# PrivateScanner

This project aims to be a FLOSS scanner PWA with no tracking/malicious code

## Prerequisites

- NodeJS
- yarn or npm
- [OpenCV.js v4.3.0](https://opencv.org/) - [Building instructions](https://docs.opencv.org/4.3.0/d4/da1/tutorial_js_setup.html)

**Note:** After building OpenCV.js, you have to copy `opencv.js` library into `src/img-proc/` directory

## Running tests

To run unit tests, you can run `yarn test` (you can set the `DRAW_OUTPUT` environment variable to draw output images)

## Running the app

To run the app for development, you can run `yarn start`

## Building the app

To build the app, you can run `yarn build`

## License

This project is licensed under the GPLv3 License - see [LICENSE](LICENSE) file for details
