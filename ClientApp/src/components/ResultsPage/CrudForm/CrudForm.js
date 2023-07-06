import React, {useEffect, useState} from 'react'
import SimpleHeader from '../../Base/SimpleHeader'
import SimpleText from '../../Base/SimpleText'
import ValidationList from '../../ValidationList'
import ResultsDropdown from '../ResultsMenu/ResultsDropdown'
import CrudTextInput from './CrudTextInput'
import {v4 as uuid} from 'uuid'
import CrudNumericInput from './CrudNumericInput'
import { CrudPasswordInput } from '../../../classes/CrudFormInput'
import TogglePasswordInput from '../../Base/TogglePasswordInput'

const CrudForm = ({title, inputs, submitText, onSubmit, globalErrors}) => {
  // inputs: [{type, title, inputId, errors}]
  const [canSubmit, setCanSubmit] = useState(true)
  useEffect(() =>{
    if (!inputs[0] || inputs[0].dontFocus) return
    const firstInput = document.getElementById(inputs[0].inputId)
    if (firstInput){
      firstInput.select()
    }
  }, [])

  const onSubmitClick = () =>{
    if (!canSubmit) return
    setCanSubmit(false)
    const domInputs = {}
    inputs.forEach(input =>{
      domInputs[input.inputId] = document.getElementById(input.inputId)
    })
    onSubmit(() =>{
      setCanSubmit(true)
    })
  }

  return (
    <div className='crud-form'>
        <SimpleHeader text={title} padding="20px" fontSize="24px"/>
        <div className='cf-inputs-section cf-section'>
          <div className="simple-center">
            <ValidationList validationMessages={globalErrors}/>
          </div>
          {inputs.map((input, i) =>{
            return (
              <div className='cfi-container' key={input.inputId}>
                <label className='cfi-label' htmlFor={input.inputId}>{input.title}</label>
                {[...Array(1)].map((x, k) =>{
                  //
                  if (input.enterSubmit)
                    input.onEnter = onSubmitClick
                  let className = input.getType()
                  
                  if (className === "CrudDropdownInput" || input.type == "dropdown"){
                    return (<ResultsDropdown key={input.inputId} dropProp={input.dropdownProp} className="crud-dropdown"/>)
                  } else if (className === "CrudNumberInput"){
                    return (<CrudNumericInput key={input.inputId} inputProp={input}/>)
                  } else if (className === "CrudPasswordInput"){
                    return (<TogglePasswordInput key={input.inputId} inputClass="crud-text-input" className="login-password-container" input={input}/>)
                  } else{
                    return (<CrudTextInput id={input.inputId} key={input.inputId} value={input.value ? input.value : input.defaultText} onEnter={(i == inputs.length - 1) ? onSubmitClick : undefined} onChange={input.onChange}/>)
                  }
                })
                }
                <ValidationList validationMessages={input.errorList.callErrors()} />
              </div>
            )
          })}
        </div>
        <div className="cf-buttons-section cf-section">
          <div className={`cf-button simple-center${canSubmit ? "" : " no-pointer-events"}`} onClick={onSubmitClick}>
            <SimpleText text={submitText} color="#fff"/>
          </div>
        </div>
    </div>
  )
}

CrudForm.defaultProps = {
    title: "Crud Form",
    submitText: "Submit",
    onSubmit: () => {},
    inputs: [],
    globalErrors: []
}

export default CrudForm