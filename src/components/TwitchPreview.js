import "./TwitchPreview.css";
import {useState} from "react";
import ToggleSwitch from "./ToggleSwitch";
import moon from "../moon.svg";

function TwitchPreview({ emoteDataUrl, badgeDataUrl }) {
  let [light, setLight] = useState(false);

  return (
    <div className={"TwitchPreview" + (light ? " Light" : "")}>
      <div className={"ChatMessage"}>
        <img className={"BadgePreview"} src={badgeDataUrl} />
        <span><span className="Username">tee_maw</span>: </span>
        <img className={"EmotePreview"} src={emoteDataUrl} />
      </div>
      <div className={"DarkToggle"}>
        <img src={moon} className={"MoonIcon" + (light ? " Light" : "")} />
        <ToggleSwitch initialState={!light} onToggle={(dark) => setLight(!dark)}/>
      </div>
    </div>
  )
}

export default TwitchPreview;
