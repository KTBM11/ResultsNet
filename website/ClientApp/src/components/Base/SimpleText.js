import React from 'react'
import Utility from './Utility'

const SimpleText = ({text, fontFamily, fontSize, color, fontWeight, className, id, width, height, fontStyle, onClick, textAlign}) => {
  return (
    <text id={id} className={Utility.joinClass('simple-text', className)} onClick={onClick} style={{width, height, fontFamily, fontSize, color, fontWeight, fontStyle, textAlign}}>{text}</text>
  )
}

SimpleText.defaultProps = {
    fontFamily: "Verdana, sans-serif",
    fontSize: "17px",
    color: "#000",
    text: "",
    fontWeight: "500",
    className: null,
    id: null,
    width: null,
    height: null,
}


export default SimpleText