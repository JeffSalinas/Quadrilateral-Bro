import React from 'react';
import Space from './space.jsx';

const Row = (props) => {

  return (
    <>
      {props.row.map((block, i) => {
        return (
          <Space
            turnToBrick={props.turnToBrick}
            img={block}
            rowIndex={props.rowIndex}
            index={i}
            key={i}
            />
        )
      })} 
    </>
  )
}

export default Row;