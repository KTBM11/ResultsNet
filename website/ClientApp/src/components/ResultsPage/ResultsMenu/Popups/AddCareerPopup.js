import React, {useState} from 'react'
import CrudForm from '../../CrudForm/CrudForm'
import Manager from '../../../../Manager'
import ClickRegistry from '../../../Base/ClickRegistry'
import Utility from '../../../Base/Utility'
import { CrudInput } from '../../../../classes/CrudFormInput'
import { CrudErrorCollection } from '../../../../classes/CrudError'
import useReload from '../../../Base/useReload'
const sharedConfig = require("../../../../SharedConfig.json")

const InitInputs = (editData) =>{
  const careerNameInput = new CrudInput("add-career-name")
  careerNameInput.title = "Career Name"
  careerNameInput.value = editData.careerName ? editData.careerName : ""
  careerNameInput.enterSubmit = true
  careerNameInput.setValidation(eList =>{
    const value = Utility.formatText(careerNameInput.value)
    const {career_name_minlength, career_name_maxlength, career_name_expression, career_name_format_message} = sharedConfig
        if (value.length < career_name_minlength || value.length > career_name_maxlength){
            eList.addError(Manager.genericLengthReason("Career name", career_name_minlength, career_name_maxlength))
        }
        if (career_name_expression != null && !(new RegExp(career_name_expression).test(value))){
            eList.appendError((career_name_format_message, "career_name_format_mismatch"))
        }
  })

  return [careerNameInput]
}

const AddCareerPopup = ({id, editData}) => {
  const [inputs] = useState(InitInputs(editData))
  const [errorCollection] = useState(new CrudErrorCollection())
  const reload = useReload()
  const isEdit = Object.keys(editData).length > 0

  const [careerNameInput] = inputs
  errorCollection.fromInputs(inputs)
  errorCollection.newList("global")

  const inputOnChange = function(e){
    this.value = e.target.value
    errorCollection.setVisible(this.inputId, false)
    reload()
  }

  careerNameInput.onChange = inputOnChange.bind(careerNameInput)

  const title = isEdit ? `Edit Career (${editData.careerName})` : `Add Career`

  
  const onSubmit = (canSubmitAgain) =>{
    const careerCallback = (errors) =>{
      canSubmitAgain()
      if (!errors) {
        Manager.ShowPopup(null)
        reload()
        
        return
      }
      
      errorCollection.addServerCollection(errors)
      reload()
    }
    const formattedInput = Utility.formatText(careerNameInput.value)
    errorCollection.setAllVisible()
    if (!errorCollection.hasErrors()){
      if (isEdit)
        Manager.editCareer(formattedInput, editData.careerId, careerCallback)
      else
        Manager.createCareer(formattedInput, careerCallback)
      return
    }
    canSubmitAgain()
    reload()
  }

  return (
    <div id={id} className='popup-shadow crud-popup'>
        <CrudForm title={title} inputs={inputs} submitText={`${isEdit ? "Save" : "Add"}`} onSubmit={onSubmit} globalErrors={errorCollection.getErrors("global")}/>
    </div>
  )
}

AddCareerPopup.defaultProps = {
  id: "add-career-popup",
  editData: {},
}

export default AddCareerPopup