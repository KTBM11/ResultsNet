import React from 'react'
import Utility from '../../Base/Utility'

const CrudTextInput = ({id, inputRef, className, onEnter, value, onChange}) => {
  const keyPressed = e =>{
    if (e.key === "Enter")
      onEnter()
  }
  return (
    <input ref={inputRef} id={id} onChange={onChange} className={Utility.joinClass("crud-text-input", className)} autoComplete="off" onKeyDown={keyPressed} value={value}/>
  )
}

CrudTextInput.defaultProps = {
  onEnter: () => {},
  value: ""
}

export default CrudTextInput