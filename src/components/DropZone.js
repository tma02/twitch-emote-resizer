import './DropZone.css';
import Button from "./Button";
import {useRef, useState} from "react";
import ProgressBar from "./ProgressBar";
import Pica from 'pica';
import * as iq from 'image-q';
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import TwitchPreview from "./TwitchPreview";

function DropZone() {
  const [draggingFile, setDraggingFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [sourceImageUrl, setSourceImageUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [emotePreviewDataUrl, setEmotePreviewDataUrl] = useState('')
  const [badgePreviewDataUrl, setBadgePreviewDataUrl] = useState('');

  const fileInputRef = useRef(null);
  const sourceImageRef = useRef(null);
  const sourceImageCanvasRef = useRef(null);

  const canvasRefs = [];
  const resized28Ref = useRef(null);
  canvasRefs.push(resized28Ref);
  const resized56Ref = useRef(null);
  canvasRefs.push(resized56Ref);
  const resized112Ref = useRef(null);
  canvasRefs.push(resized112Ref);
  const resized18Ref = useRef(null);
  canvasRefs.push(resized18Ref);
  const resized36Ref = useRef(null);
  canvasRefs.push(resized36Ref);
  const resized72Ref = useRef(null);
  canvasRefs.push(resized72Ref);

  const handleChangeFile = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name.split('.')[0]);
      setSourceImageUrl(URL.createObjectURL(e.target.files[0]));
      setProgress(1);
      setLoadingText('Loading image...');
    }
  };
  const handleClickChooseFile = e => {
    fileInputRef.current.click();
  };
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFile(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFile(false);
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFile(false);
    if (e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name.split('.')[0]);
      setSourceImageUrl(URL.createObjectURL(e.dataTransfer.files[0]));
      setProgress(1);
      setLoadingText('Loading image...');
    }
  };
  const handleImageLoad = e => {
    // Preserve aspect ratio
    let naturalWidth = sourceImageRef.current.naturalWidth;
    let naturalHeight = sourceImageRef.current.naturalHeight;
    let maxSideLength = Math.max(naturalWidth, naturalHeight);
    sourceImageCanvasRef.current.width = maxSideLength;
    sourceImageCanvasRef.current.height = maxSideLength;
    let sourceImageCanvasContext = sourceImageCanvasRef.current.getContext('2d');
    let widthOffset = Math.round((maxSideLength - naturalWidth) / 2);
    let heightOffset = Math.round((maxSideLength - naturalHeight) / 2);
    sourceImageCanvasContext.drawImage(sourceImageRef.current, widthOffset, heightOffset);
    // Resize
    let resized = 0;
    let withinSize = 0;
    setProgress(10);
    setLoadingText(`Resizing image... (${resized}/${canvasRefs.length})`);
    const pica = new Pica();
    for (let canvasRef of canvasRefs) {
      pica.resize(sourceImageCanvasRef.current, canvasRef.current, {
        quality: 3,
        alpha: true,
      }).then(() => {
        resized += 1;
        setProgress(10 + ((resized / canvasRefs.length) * 70) + ((withinSize / canvasRefs.length) * 20));
        setLoadingText(`Resizing image... (${resized}/${canvasRefs.length})`);

        let compressionPass = 0;
        let colorsPower = 15

        function tryCompressionPass(canvasRef, colorsPower) {
          setLoadingText(`Compressing image... (Pass ${++compressionPass})`);
          let ctx = canvasRef.current.getContext('2d');
          let resizedPointContainer = iq.utils.PointContainer.fromHTMLCanvasElement(canvasRef.current);
          iq.buildPalette([resizedPointContainer], { colors: Math.pow(2, colorsPower) }).then(palette => {
            let imageData = ctx.createImageData(canvasRef.current.width, canvasRef.current.height);
            imageData.data.set(iq.applyPaletteSync(resizedPointContainer, palette).toUint8Array());
            ctx.putImageData(imageData, 0, 0);
          }).then(() => {
            if (estimateCanvasFileSize(canvasRef.current) > 25000 && colorsPower > 0) {
              tryCompressionPass(canvasRef, colorsPower - 1);
            }
            else {
              withinSize += 1;
              setProgress(10 + ((resized / canvasRefs.length) * 70) + ((withinSize / canvasRefs.length) * 20));
            }
          });
        }

        if (estimateCanvasFileSize(canvasRef.current) > 25000) {
          tryCompressionPass(canvasRef, colorsPower);
        }
        else {
          withinSize += 1;
          setProgress(10 + ((resized / canvasRefs.length) * 70) + ((withinSize / canvasRefs.length) * 20));
          if (canvasRef.current.width === 112) {
            setEmotePreviewDataUrl(canvasRef.current.toDataURL());
          }
          else if (canvasRef.current.width === 72) {
            setBadgePreviewDataUrl(canvasRef.current.toDataURL());
          }
        }
      });
    }
  };
  const handleSaveAll = e => {
    let zip = new JSZip();
    for (let canvasRef of canvasRefs) {
      canvasRef.current.toBlob(blob => {
        zip.file(`${fileName}@${canvasRef.current.width}.png`, blob);
        if (Object.keys(zip.files).length === canvasRefs.length) {
          zip.generateAsync({ type: 'blob' }).then(zipData => {
            saveAs(zipData, `${fileName}.zip`);
          });
        }
      });
    }
  };
  const handleSaveImage = canvasRef => {
    canvasRef.current.toBlob(blob => {
      saveAs(blob, `${fileName}@${canvasRef.current.width}.png`);
    });
  };
  return (
    <div className={
      'DropZone' + (draggingFile ? ' Dragging' : '')
      + (progress > 0 && progress < 100 ? ' Loading' : '')
      + (progress === 100 ? ' Done' : '')
    }
         onDrop={handleDrop}
         onDragEnter={handleDragEnter}
         onDragLeave={handleDragLeave}
         onDragOver={handleDragOver}
    >
      <img className="SourceImage" src={sourceImageUrl} ref={sourceImageRef} onLoad={handleImageLoad} alt="Source"/>
      <canvas className="SourceImage" ref={sourceImageCanvasRef}/>
      <input id="ImageInput"
             type="file"
             accept="image/*"
             ref={fileInputRef}
             style={{display: 'none'}}
             onChange={handleChangeFile}
      />
      <div className="DropCallToAction">
        <h2>Drop your image here or </h2>
        <Button clickHandler={handleClickChooseFile}>Choose file</Button>
      </div>
      <div className="LoadingContainer">
        <h4>{loadingText}</h4>
        <ProgressBar progress={progress} />
      </div>
      <div className="ResizedContainer">
        <TwitchPreview emoteDataUrl={emotePreviewDataUrl} badgeDataUrl={badgePreviewDataUrl} />
        <div className="ResizedRow">
          <div onClick={() => handleSaveImage(resized112Ref)} style={{ cursor: 'pointer' }}>
            <canvas className="ResizedCanvas By112" width="112" height="112" ref={resized112Ref}/>
            <div className="ImageSize">112x112 ({bytesToKilobytes(estimateCanvasFileSize(resized112Ref.current))}KB)</div>
          </div>
          <div onClick={() => handleSaveImage(resized56Ref)} style={{ cursor: 'pointer' }}>
            <canvas className="ResizedCanvas By56" width="56" height="56" ref={resized56Ref}/>
            <div className="ImageSize">56x56 ({bytesToKilobytes(estimateCanvasFileSize(resized56Ref.current))}KB)</div>
          </div>
          <div onClick={() => handleSaveImage(resized28Ref)} style={{ cursor: 'pointer' }}>
            <canvas className="ResizedCanvas By28" width="28" height="28" ref={resized28Ref}/>
            <div className="ImageSize">28x28 ({bytesToKilobytes(estimateCanvasFileSize(resized28Ref.current))}KB)</div>
          </div>
        </div>
        <div className="ResizedRow">
          <div onClick={() => handleSaveImage(resized72Ref)} style={{ cursor: 'pointer' }}>
            <canvas className="ResizedCanvas By72" width="72" height="72" ref={resized72Ref}/>
            <div className="ImageSize">72x72 ({bytesToKilobytes(estimateCanvasFileSize(resized72Ref.current))}KB)</div>
          </div>
          <div onClick={() => handleSaveImage(resized36Ref)} style={{ cursor: 'pointer' }}>
            <canvas className="ResizedCanvas By36" width="36" height="36" ref={resized36Ref}/>
            <div className="ImageSize">36x36 ({bytesToKilobytes(estimateCanvasFileSize(resized36Ref.current))}KB)</div>
          </div>
          <div onClick={() => handleSaveImage(resized18Ref)} style={{ cursor: 'pointer' }}>
            <canvas className="ResizedCanvas By18" width="18" height="18" ref={resized18Ref}/>
            <div className="ImageSize">18x18 ({bytesToKilobytes(estimateCanvasFileSize(resized18Ref.current))}KB)</div>
          </div>
        </div>
        <div>
          <p>Click an image to save it or</p>
          <Button clickHandler={handleSaveAll}>Save all (.zip)</Button>
        </div>
      </div>
    </div>
  );
}

function estimateCanvasFileSize(canvas) {
  if (canvas === null) {
    return 0;
  }
  const imageDataHeader = 'data:image/png;base64,';
  return Math.round((canvas.toDataURL('image/png').length - imageDataHeader.length) * (3/4));
}

function bytesToKilobytes(bytes) {
  return (bytes / 1024).toFixed(2);
}

export default DropZone;
