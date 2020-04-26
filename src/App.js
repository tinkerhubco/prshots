import React, { useState } from 'react';

import { Dropzone } from './components/Dropzone';

import mergeImages from 'merge-images';

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 256,
  height: 256,
  padding: 4,
  boxSizing: 'border-box',
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
};

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16,
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%',
};

const getImageWidthFromBlob = async (imageUrl) => {
  const imgEl = new Image();

  imgEl.src = imageUrl;

  return new Promise((resolve, reject) => {
    imgEl.onload = () => resolve(imgEl.naturalWidth);
    imgEl.onerror = reject;
  });
};

function App() {
  const [files, setFiles] = useState([]);

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img alt={file.name} src={file.preview} style={img} />
      </div>
    </div>
  ));

  const handleClick = async () => {
    const imagePreviews = files.map(({ preview, xOffset }) => ({
      src: preview,
      x: xOffset,
      y: 0,
    }));

    const canvasWidth = files.reduce(
      (acc, { imageWidth }) => acc + imageWidth,
      0
    );

    const base64Image = await mergeImages(imagePreviews, {
      quality: 1,
      width: canvasWidth,
    });

    const a = document.createElement('a');

    a.href = base64Image;
    a.download = 'download.png';

    a.click();
  };

  const showDownloadButton = !!files.length;

  return (
    <main>
      <div>
        <Dropzone
          onDrop={async (acceptedFiles) => {
            const previews = acceptedFiles.map((file) =>
              URL.createObjectURL(file)
            );

            const imageWidths = await Promise.all(
              previews.map((preview) => getImageWidthFromBlob(preview))
            );

            const xOffsets = imageWidths.reduce(
              (acc, imageWidth, index) => {
                const { accumulatedXOffset } = acc;
                const nextOffset = accumulatedXOffset;

                return {
                  ...acc,
                  [index]: nextOffset,
                  accumulatedXOffset: nextOffset + imageWidth,
                };
              },
              { accumulatedXOffset: 0 }
            );

            const filesState = acceptedFiles.map((file, index) =>
              Object.assign(file, {
                preview: previews[index],
                imageWidth: imageWidths[index],
                xOffset: xOffsets[index],
              })
            );

            setFiles(filesState);
          }}
        />
        <aside style={thumbsContainer}>{thumbs}</aside>
      </div>
      {showDownloadButton && <button onClick={handleClick}>download</button>}
    </main>
  );
}

export default App;
