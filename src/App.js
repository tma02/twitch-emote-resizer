import './App.css';
import DropZone from './components/DropZone';
import info from './info.svg';

function App() {
  return (
    <div className="App">
      <h4>Twitch Emote Resizer</h4>
      <DropZone />
      <div className="Info">
        <img src={info} className="InfoIcon" alt="info icon" />
        <p>
          This page will resize an image into the sizes Twitch requires for emotes and badges.
          <br/>
          If the resized image is larger than Twitch's size limit of 25KB, this page will also attempt to compress it.
          <br/>
          Image processing is done in your browser. Your image never leaves your device.
        </p>
      </div>
      <div className="Spacer"/>
    </div>
  );
}

export default App;
