import React, {useMemo, useState} from 'react'
import CrudForm from '../../../CrudForm/CrudForm'
import Utility from '../../../../Base/Utility'
import Manager from '../../../../../Manager'
import AddCompetitionExtention from './AddCompetitionExtention'
import { CrudDropdownInput, CrudInput, CrudNumberInput } from '../../../../../classes/CrudFormInput'
import DropdownButton from '../../../../../classes/DropdownButton'
import { OptionButton } from '../../../../../classes/DropdownOption'
import SimplePrompt from '../../../../Base/SimplePromp'
import { PopupProp } from '../../../../../classes/PopupCollectionProp'
import useReload from '../../../../Base/useReload'
import { CrudErrorCollection } from '../../../../../classes/CrudError'
const sharedConfig = require("../../../../../SharedConfig.json")
const {competition_name_minlength, competition_name_maxlength, competition_name_expression, competition_name_format_message} = sharedConfig

class ReturnData{
  action;
  newSelectedFormatName;
  constructor(_action){
    this.action = _action
  }
}


const createInputs2 = (editData) =>{
  const compNameInput = new CrudInput("add-comp-name")
  compNameInput.title = "Competition Name"
  compNameInput.value = editData ? editData.name : ""
  compNameInput.setValidation(eList =>{
    const v = Utility.formatText(compNameInput.value)
    if (v.length < competition_name_minlength || v.length > competition_name_maxlength)
        eList.appendError(`Name must be between ${competition_name_minlength} and ${competition_name_maxlength} characters`, "competition_name_incorrect_length")
      if (competition_name_expression != null && !(new RegExp(competition_name_expression).test(v)))
        eList.appendError(competition_name_format_message, "competition_name_format_mismatch")
  })

  const formatNameInput = new CrudDropdownInput("add-comp-format-name")
  formatNameInput.title = "Format"
  formatNameInput.dropdownProp.defaultTitle = "Select Format"
  formatNameInput.setValidation(eList =>{
    const v = formatNameInput.value
      if (v == null)
        eList.appendError("Competition format is required", "competition_format_no_exist")
  })

  const startAtInput = new CrudNumberInput("add-comp-startat")
  startAtInput.min = 1
  startAtInput.max = 100
  startAtInput.title = "Start At"
  startAtInput.integerOnly = true
  startAtInput.value = editData ? editData.startAt : 1
  startAtInput.setValidation(eList =>{
    const v = startAtInput.value
      if (v === "")
        eList.appendError("Start at is required", "start_at_no_exist")
      else if (!startAtInput.validInput()){
        eList.appendError(`Must be a number between ${startAtInput.min} and ${startAtInput.max}`, "competition_startat_invalid")
      }
  })
  return [compNameInput, formatNameInput, startAtInput]
}

export class EditCompetitionData{
  name;
  formatName;
  startAt;
  id;
  constructor(competition){
    this.name = competition.name
    this.formatName = competition.formatName
    this.startAt = competition.startAt
    this.id = competition.competitionId
  }
}

const AddCompetitionPopup = ({id, editData}) => {
    const isEdit = editData != null
    const [formatCreatorOpen, setFormatCreatorOpen] = useState(false)
    const [creatorData, setCreatorData] = useState(null)
    const [inputs, setInputs] = useState(createInputs2(editData))
    const [errorCollection] = useState(new CrudErrorCollection())
    const [compNameInput, formatNameInput, startAtInput] = inputs
    errorCollection.fromInputs(inputs)
    errorCollection.newList("global")


    const title = isEdit ? `Edit Competition (${editData.name})` : "Add Competition"
    const reload = useReload()
    //

    //const inputs = []
    //
    //
    //
    
    compNameInput.onChange = (e) =>{
      compNameInput.value = e.target.value
      errorCollection.setVisible(compNameInput.inputId, false)
      reload()
    }

    startAtInput.onChange = e =>{
      startAtInput.value = e.target.value
      errorCollection.setVisible(startAtInput.inputId, false)
      reload()
    }

    formatNameInput.dropdownProp.reset()
    
    const optionButtons = []
    const removeFormatNo = function(){
      Manager.popup.removePopup("remove-format-prompt")
    }
    const removeFormatYes = function(){
      //
      Manager.removeCompetitionFormat(this.value, success =>{
        if (!success) return
        Manager.popup.removePopup("remove-format-prompt")
        formatNameInput.dropdownProp.removeOption(this.value)
        if (this.value === formatNameInput.value)
          formatNameInput.value = null
        reload()
        Manager.reload()
      })
    }
    const removeFormatButton = new OptionButton("Remove Format", "fa-solid fa-thin fa-xmark icon-cross", (option) =>{
      Manager.popup.addPopup(new PopupProp("remove-format-prompt", (<SimplePrompt title={`Are you sure you want to remove this format? (${option.value})`} yesClick={removeFormatYes.bind(option)} noClick={removeFormatNo.bind(option)}/>)), true)
    })

    const editFormatButton = new OptionButton("Edit Format", "fa-solid fa-pen dropdown-pen", (option) =>{
      setCreatorData(Manager.getFormatData(option.value))
      setFormatCreatorOpen(true)
    })

    optionButtons.push(editFormatButton, removeFormatButton)
    formatNameInput.dropdownProp.fromArray(Manager.getFormatNames(), optionButtons)
    formatNameInput.onChange = (selectedOption) =>{
      reload()
      errorCollection.setVisible(formatNameInput.inputId, false)
      return true
    }
    useMemo(() =>{
      formatNameInput.dropdownProp.setSelectedFromValue(editData ? editData.formatName : null)
    }, [])

    const createFormatButton = new DropdownButton()
    createFormatButton.text = "Create Format"
    createFormatButton.onClick = () =>{
      setFormatCreatorOpen(true)
    }
    formatNameInput.addButton(createFormatButton)

    const goBack = (returnData) =>{
      compNameInput.shouldFocus = false
      setFormatCreatorOpen(false)
      setCreatorData(null)
      formatNameInput.dropdownProp.setSelectedFromValue(returnData.newSelectedFormatName)
      reload()
      if (returnData.action == "save")
        Manager.reload()
    }


    const onSubmit = (setCanSubmit) =>{
      errorCollection.setAllVisible()
      if (errorCollection.hasErrors()){
        setCanSubmit()
        reload()
        return
      }
      const submitResponse = (errors) =>{
        setCanSubmit()
        if (!errors) {
          Manager.popup.closePopups()
          Manager.reload()
          return
        }
        errorCollection.addServerCollection(errors)
        reload()
      }
      if (isEdit)
        Manager.editCompetition(Utility.formatText(compNameInput.value), formatNameInput.value, Number(startAtInput.value), editData.id, false, false, submitResponse)
      else
        Manager.createCompetition(Utility.formatText(compNameInput.value), formatNameInput.value, Number(startAtInput.value), submitResponse)

      reload()
      setCanSubmit()
    }

    let innerPopup
    if (formatCreatorOpen)
      innerPopup = (<AddCompetitionExtention goBack={goBack} editFormatData={creatorData} selectedFormatName={formatNameInput.dropdownProp.getSelectedValue()}/>)
    else
      innerPopup = (<CrudForm title={title} inputs={inputs} onSubmit={onSubmit} submitText={isEdit ? "Save" : "Add"} globalErrors={errorCollection.getErrors("global")}/>)

  return (
    <div id={id} className='popup-shadow crud-popup'>
        {innerPopup}
    </div>
  )
}

AddCompetitionPopup.defaultProps = {
    id: "add-competition-popup"
}

export default AddCompetitionPopup
export {ReturnData}