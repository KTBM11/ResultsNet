import React from 'react'
import TriangleProper from './TriangleProper'

const Arrows = ({triangleWidth, triangleHeight, gap}) => {
    
  return (
    <div className='arrow-container' style={{gap, display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center"}}>
        <TriangleProper triangleHeight={triangleHeight} triangleWidth={triangleWidth}/>
        <TriangleProper direction='down' triangleHeight={triangleHeight} triangleWidth={triangleWidth}/>
    </div>
  )
}

Arrows.defaultProps = {
    triangleWidth: '8px',
    triangleHeight: '5.5px',
    gap: '2px',
}

export default Arrows