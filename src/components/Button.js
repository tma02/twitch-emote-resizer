import './Button.css';

function Button({clickHandler, children}) {
  return (
    <div className="Button" onClick={clickHandler}>
      {children}
    </div>
  );
}

export default Button;
