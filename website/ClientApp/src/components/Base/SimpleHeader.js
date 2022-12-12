import React from 'react'
import SimpleText from './SimpleText'
import Utility from './Utility'

const SimpleHeader = ({padding, text, fontFamily, fontSize, color, fontWeight, className, id, width, height, fontStyle}) => {
  return (
    <div id={id} className={Utility.joinClass('simple-center simple-header', className)} style={{padding}}>
        <SimpleText className="simple-header-text" text={text} textAlign="center" fontFamily={fontFamily} fontSize={fontSize} color={color} fontWeight={fontWeight} width={width} height={height}
        fontStyle={fontStyle}/>
    </div>
  )
}

SimpleHeader.defaultProps = {
    padding: "10px",
}

export default SimpleHeader