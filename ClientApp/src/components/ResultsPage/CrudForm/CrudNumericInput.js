import React from 'react'
import Utility from '../../Base/Utility'

const CrudNumericInput = ({className, inputProp}) => { //inputProp = CrudNumberInput
    const keyPressed = e =>{
        if (e.key === "Enter")
          inputProp.onEnter()
      }

      //

    const beforeInput = (e) =>{
        const sStart = e.target.selectionStart
        const sEnd = e.target.selectionEnd
        const cText = e.target.value
        const wouldBe = cText.substring(0, sStart) + e.data + cText.substring(sEnd)
        if (!inputProp.canInput(wouldBe))
            e.preventDefault()
    }

  return (
    <input id={inputProp.inputId} className={Utility.joinClass("crud-text-input", className)} autoComplete="off" onChange={inputProp.onChange} onKeyDown={keyPressed} onBeforeInput={beforeInput} value={inputProp.value}/>
  )
}

export default CrudNumericInput