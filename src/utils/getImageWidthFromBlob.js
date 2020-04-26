export async function getImageWidthFromBlob(imageUrl) {
  const imgEl = new Image();

  imgEl.src = imageUrl;

  return new Promise((resolve, reject) => {
    imgEl.onload = () => resolve(imgEl.naturalWidth);
    imgEl.onerror = reject;
  });
}
