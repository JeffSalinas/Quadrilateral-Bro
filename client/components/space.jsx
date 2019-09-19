import React from'react'

const Space = (props) => {

  return (
    <>
      <img className="blocks" onClick={() => props.turnToBrick(null, props.rowIndex, props.index)} src={props.img}></img>
      {/* <img className="blocks" src={props.img}></img> */}
    </>
  )
}

export default Space;
