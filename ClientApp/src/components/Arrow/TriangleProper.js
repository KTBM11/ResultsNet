import React from 'react'
import Utility from '../Base/Utility'

const TriangleProper = ({triangleWidth, triangleHeight, direction, color}) => {
    let bTop, bRight, bBottom, bLeft
    if (direction == 'up' || direction == 'down'){
        bTop = direction == 'up' ? '' : `${triangleHeight} solid ${color}`
        bBottom = direction == 'down' ? '' : `${triangleHeight} solid ${color}`
        bRight = `${Utility.fromPx(triangleWidth) / 2}px solid transparent`
        bLeft = `${Utility.fromPx(triangleWidth) / 2}px solid transparent`
    } else {
        bTop = `${Utility.fromPx(triangleWidth) / 2}px solid transparent`
        bBottom = `${Utility.fromPx(triangleWidth) / 2}px solid transparent`
        bLeft = direction == 'right' ? '' : `${triangleHeight} solid ${color}`
        bRight = direction == 'left' ? '' : `${triangleHeight} solid ${color}`
    }
  return (
    <div className={`center triangle-proper-${direction}`} style={{width: triangleWidth, height: triangleHeight}}>
        <div style={{width: 0, height:0, borderLeft: bLeft, borderRight: bRight, borderTop: bTop, borderBottom: bBottom}}></div> 
    </div>
  )
}

TriangleProper.defaultProps = {
    triangleWidth: '30px',
    triangleHeight: '30px',
    direction: 'up',
    color: '#000',
}

export default TriangleProper