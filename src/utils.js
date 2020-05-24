export function createImageFromBlob(blob) {
  return new Promise(resolve => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.src = imageUrl;
  });
}
