import React from 'react';
import ReactDOM from 'react-dom';

const Password = (props) => {

  return (
    ReactDOM.createPortal(
      <div className="popupStyle">
        <div className="title">
          <h3>Quadrilateral Bro</h3>
        </div>
        <div id="text">
          Password:
          <input></input>
        </div>
        <p className="pswInstruction">{'Password ? jumpToLvl() : '}<br></br>
        {'*Press Any Key To Begin*'}
        </p>
      </div>,
      document.getElementById('password')
    )
  )
}

export default Password;