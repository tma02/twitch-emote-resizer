import "./ResizedImage.css";
import Button from "./Button";

function ResizedImage({children, progressText, size, fileSize}) {
  return (
    <div className={"ResizedImage"}>
      <div className={"Preview"}>
        {children}
      </div>
      <div className={"Info"}>
        <span>{size}px x {size}px</span>
        <span className={"FileSize"}>{fileSize}KB</span>
      </div>
    </div>
  );
}

export default ResizedImage;
