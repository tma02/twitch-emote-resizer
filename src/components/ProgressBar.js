import './ProgressBar.css';

function ProgressBar({progress}) {
  return (
    <div className='ProgressBar'>
      <div className='ProgressBarInner' style={{ width: `${progress}%` }}/>
    </div>
  );
}

export default ProgressBar;
