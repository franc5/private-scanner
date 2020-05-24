export function loadBlobPhotoIntoTargetImg(target, blob) {
  return new Promise(resolve => {
    const imageUrl = URL.createObjectURL(blob);
    target.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve();
    };
    target.src = imageUrl;
  });
}
