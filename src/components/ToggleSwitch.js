import "./ToggleSwitch.css";
import {useState} from "react";

function ToggleSwitch({ initialState, onToggle }) {
  let [state, setState] = useState(initialState);

  let onClick = () => {
    setState(!state);
    onToggle(!state);
  };

  return (
    <div className={'ToggleSwitch' + (state ? ' On' : '')} onClick={onClick}>
      <div className={'Inner'} />
    </div>
  );
}

export default ToggleSwitch;
