import React, { useState } from 'react'
import Utility from '../../../Base/Utility'
import CrudForm from '../../CrudForm/CrudForm'
import Manager from '../../../../Manager'
import { CrudInput } from '../../../../classes/CrudFormInput'
import { CrudErrorCollection } from '../../../../classes/CrudError'
import useReload from '../../../Base/useReload'
const sharedConfig = require("../../../../SharedConfig.json")
const {season_name_minlength, season_name_maxlength, season_name_expression, season_name_format_message,
    season_teamname_minlength, season_teamname_maxlength, season_teamname_expression, season_teamname_formate_message} = sharedConfig

const InitInputs = (editData) =>{
    const seasonNameInput = new CrudInput("add-season-name")
    seasonNameInput.title = "Season Name"
    seasonNameInput.value = editData.seasonName ? editData.seasonName : ""
    seasonNameInput.setValidation(eList =>{
        const seasonName = Utility.formatText(seasonNameInput.value)
        if (seasonName.length < season_name_minlength || seasonName.length > season_name_maxlength){
            eList.addError(Manager.genericLengthReason("Season name", season_name_minlength, season_name_maxlength))
        }
        if (season_name_expression != null && !(new RegExp(season_name_expression).test(seasonName))){
            eList.addError({msg: season_name_format_message, code: "season_name_format_mismatch"})
        }
    })

    const seasonTeamNameInput = new CrudInput("add-season-team-name")
    seasonTeamNameInput.title = "Team Name"
    seasonTeamNameInput.value = editData.seasonTeamName ? editData.seasonTeamName : ""
    seasonTeamNameInput.setValidation(eList =>{
        const teamName = Utility.formatText(seasonTeamNameInput.value)
        if (teamName.length < season_teamname_minlength || season_name_maxlength > season_teamname_maxlength){
            eList.addError(Manager.genericLengthReason("Team name", season_teamname_minlength, season_teamname_maxlength))
        }
        if (season_teamname_expression != null && !(new RegExp(season_teamname_expression).test(teamName))){
            eList.addError({msg: season_teamname_formate_message, code: "team_name_format_mismatch"})
        }
    })

    return [seasonNameInput, seasonTeamNameInput]
}

const AddSeasonPopup = ({id, editData}) => {
    const [inputs] = useState(InitInputs(editData))
    const [errorCollection] = useState(new CrudErrorCollection())
    const reload = useReload()
    const isEdit = Object.keys(editData).length > 0
    //vMessages.global.push({msg: "global error", code: "global_error"})
    const [seasonNameInput, seasonTeamNameInput] = inputs
    errorCollection.fromInputs(inputs)
    errorCollection.newList("global")

    const inputOnChange = function(e){
        this.value = e.target.value
        errorCollection.setVisible(this.inputId, false)
        reload()
    }

    seasonNameInput.onChange = inputOnChange.bind(seasonNameInput)
    seasonTeamNameInput.onChange = inputOnChange.bind(seasonTeamNameInput)

    const title = isEdit ? `Edit Season (${editData.seasonName})` : `Add Season`

    const onSubmit = (setButtonActive) =>{
        const fSeasonName = Utility.formatText(seasonNameInput.value)
        const fSeasonTeamName = Utility.formatText(seasonTeamNameInput.value)
        errorCollection.setAllVisible()
        if (errorCollection.hasErrors()){
            setButtonActive()
            reload()
        }

        const seasonCallback = (errors) =>{
            setButtonActive()
            if (!errors)
                return Manager.ShowPopup(null)
            errorCollection.addServerCollection(errors)
            reload()
        }
        if (isEdit)
            Manager.editSeason(fSeasonName, fSeasonTeamName, editData.seasonId, seasonCallback)
        else
            Manager.createSeason(fSeasonName, fSeasonTeamName, seasonCallback)
    }
  return (
    <div id={id} className="popup-shadow crud-popup">
        <CrudForm title={title} inputs={inputs} submitText={isEdit ? "Save": "Add"} onSubmit={onSubmit} globalErrors={errorCollection.getErrors("global")}/>
    </div>
  )
}

AddSeasonPopup.defaultProps = {
    id: "add-season-popup",
    editData: {},
}

export default AddSeasonPopup