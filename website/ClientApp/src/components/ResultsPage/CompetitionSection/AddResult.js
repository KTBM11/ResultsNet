import React, { useState, useRef, useEffect } from 'react'
import { DropdownOption } from '../../../classes/DropdownOption'
import DropdownProp from '../../../classes/DropdownProp'
import Manager from '../../../Manager'
import SimpleText from '../../Base/SimpleText'
import ResultsDropdown from '../ResultsMenu/ResultsDropdown'
import ResultsPanelSection from './ResultsPanelSection'
import CrudTextInput from '../CrudForm/CrudTextInput'
import { CrudInput, CrudNumberInput } from '../../../classes/CrudFormInput'
import CrudNumericInput from '../CrudForm/CrudNumericInput'
import { v4 as uuid } from 'uuid'
import SimpleIcon from '../../Base/SimpleIcon'
import Utility from "../../Base/Utility"
import { CrudErrorCollection } from '../../../classes/CrudError'
import SimpleTextInput from '../../Base/SimpleTextInput'
const {season_teamname_minlength, season_teamname_maxlength, season_teamname_expression, season_teamname_format_message} = require("../../../SharedConfig.json")

const hd = function(){
    const dropdownProp = new DropdownProp()
    dropdownProp.addOption(new DropdownOption("Home", "home"), true)
    dropdownProp.addOption(new DropdownOption("Away", "away"))
    return dropdownProp
}

const scoreProp = function(id){
    const sp = new CrudNumberInput(`${id}_${uuid()}`)
    sp.min = 0
    sp.max = 99
    sp.value = ""
    sp.setValidation(eList =>{
        if (!sp.validInput())
            eList.appendError("Invalid score", "result_score_invalid")
    })
    return sp
}

const oppTeamProp = function(){
    const oppTeam = new CrudInput(`result-opp-team_${uuid()}`)
    oppTeam.value = ""
    oppTeam.setValidation(eList =>{
        const v = Utility.formatText(oppTeam.value)
        if (v.length < season_teamname_minlength || v.length > season_teamname_maxlength)
            eList.appendError(`Team name must be between ${season_teamname_minlength} and ${season_teamname_maxlength} characters`, "result_oppteam_incorrect_length")
        if (season_teamname_expression != null && !(new RegExp(season_teamname_expression).test(v)))
            eList.appendError(season_teamname_format_message, "result_oppteam_format_mismatch")
        /*if (Utility.formatText(oppTeam.value) === ""){
            eList.appendError("Opp team is empty", "result_oppteam_empty")
        }*/
    })
    return oppTeam
}

export const AddResult = ({competitionId}) => {
    const [homeDropdown, setHomeDropdown] = useState(hd())
    const [oppTeam, setOppTeam] = useState(oppTeamProp())
    const [goalsFor, setGoalsFor] = useState(scoreProp(`result-goals-for`))
    const [goalsAgaints, setGoalsAgaints] = useState(scoreProp(`result-goals-againts`))
    const [isReplay, setReplay] = useState(false)
    const [submitEnabled, setSubmitEnabled] = useState(true)
    const [errorCollection] = useState(new CrudErrorCollection())
    const [focusedId, setFocusedIndexId] = useState(null)
    errorCollection.fromInputs([oppTeam, goalsFor, goalsAgaints])
    errorCollection.setAllVisible();
    const didMountOnce = useRef(false)
    const [r, setR] = useState(false)
    const inpOrder = homeDropdown.getSelectedValue() == "home" ? [goalsFor.inputId, goalsAgaints.inputId, oppTeam.inputId] : [oppTeam.inputId, goalsAgaints.inputId, goalsFor.inputId]

    useEffect(() =>{
        if (didMountOnce.current && submitEnabled)
        document.getElementById(inpOrder[0]).focus()
    }, [submitEnabled])

    useEffect(() =>{
        if (focusedId && didMountOnce.current)
            document.getElementById(focusedId).focus()
    }, [focusedId])

    useEffect(() =>{
        didMountOnce.current = true
    })


    //
    const reload = (cleanSlate=false) => {
        
        if (cleanSlate){
            oppTeam.value = ""
            goalsFor.value = ""
            goalsAgaints.value = ""
            setReplay(false)
        }
        setR(prevR => !prevR)
    }
   // 

    const teamName = Manager.getSelectedSeason().teamName

    oppTeam.onChange = e =>{
        oppTeam.value = e.target.value
        reload()
    }

    goalsFor.onChange = e =>{
        goalsFor.value = e.target.value
        reload()
    }

    goalsAgaints.onChange = e =>{
        goalsAgaints.value = e.target.value
        reload()
    }

    const onInputEnter = (input) =>{
        const index = inpOrder.indexOf(input.inputId)
        
        if (index === inpOrder.length - 1){
            return submit()
        }
        
        document.getElementById(inpOrder[index+1]).select()
    }

    oppTeam.onEnter = onInputEnter.bind(null, oppTeam)
    goalsFor.onEnter = onInputEnter.bind(null, goalsFor)
    goalsAgaints.onEnter = onInputEnter.bind(null, goalsAgaints)

    //const oppTeamInput = (<CrudTextInput key={oppTeam.inputId} id={oppTeam.inputId} value={oppTeam.value} onChange={oppTeam.onChange} onEnter={oppTeam.onEnter}/>)
    const teamInputContentRender = (contentId, maxHeight, setDirection) =>{
        const content = document.getElementById(contentId)
        const header = document.getElementById("results-header")
        const cRect = content.getBoundingClientRect()
        const hRect = header.getBoundingClientRect()
        const inputRect = document.getElementById(oppTeam.inputId).getBoundingClientRect()
        //
        //
        if (inputRect.top - maxHeight < hRect.bottom)
            setDirection("down")
        else 
            setDirection("up")
    }
    const oppTeamInput = (<SimpleTextInput input={oppTeam} list={Manager.getTeamNames()} inputClass="crud-text-input" postRender={teamInputContentRender}/>)
    const goalsForInput = (<CrudNumericInput key={goalsFor.inputId} className="score-input" inputProp={goalsFor}/>)
    const goalsAgaintsInput = (<CrudNumericInput key={goalsAgaints.inputId} className="score-input" inputProp={goalsAgaints}/>)
    const scores = {
        "home": homeDropdown.getSelectedValue() === "home" ? goalsForInput : goalsAgaintsInput,
        "away": homeDropdown.getSelectedValue() === "away" ? goalsForInput : goalsAgaintsInput
    }

    const getHomeComponent = () =>{
        if (homeDropdown.getSelectedValue() === "home"){
            return (<SimpleText className={"base-single-line"} textAlign="right" text={teamName}/>)
        }
        return oppTeamInput
    }

    const getAwayComponent = () =>{
        if (homeDropdown.getSelectedValue() === "away"){
            return (<SimpleText className={"base-single-line"} text={teamName}/>)
        }
        return oppTeamInput
    }

    homeDropdown.onOptionSelect = (option) =>{
        reload()
        setFocusedIndexId(inpOrder[2])
        return true
    }

    const replayCheckboxClick = () =>{
        setReplay(prevReplay => !prevReplay)
    }

    const canSubmit = () =>{
        return submitEnabled && !errorCollection.hasErrors()
    }

    const submit = () =>{
        if (!canSubmit()) return
        setSubmitEnabled(false)
        
        Manager.createResult(competitionId, Utility.formatText(oppTeam.value), goalsFor.value, goalsAgaints.value, isReplay, homeDropdown.getSelectedValue() === "home", (errors) =>{
            setSubmitEnabled(true)
            if (!errors){
                reload(true)
                Manager.reload()
                return
            }
            //
            errorCollection.addServerCollection(errors)
        })
    }

  return (
    <div className='add-result-container'>
        <ResultsPanelSection className="rp1">
            <ResultsDropdown dropProp={homeDropdown} className="add-result-dropdown"/>
        </ResultsPanelSection>
        <ResultsPanelSection className="rp2">{getHomeComponent()}</ResultsPanelSection>
        <ResultsPanelSection className="rp3">
            {scores["home"]}
           –
            {scores["away"]}
        </ResultsPanelSection>
        <ResultsPanelSection className="rp4">{getAwayComponent()}</ResultsPanelSection>
        <ResultsPanelSection className="rp5">
            <div className='arc-buttons'>
                <input className="arc-checkbox" type="checkbox" checked={isReplay} onChange={replayCheckboxClick} title="Replay"/>
                <SimpleIcon containerClassName={Utility.joinClass("arc-plus", canSubmit() ? "enabled" : null)} iconClassName="fa-regular fa-plus fa-solid" onClick={submit}/>
            </div>
        </ResultsPanelSection>
    </div>
  )
}
