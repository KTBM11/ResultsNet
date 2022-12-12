import React, {useEffect, useRef, useState} from 'react'
import SimpleHeader from '../../../../Base/SimpleHeader'
import SimpleText from '../../../../Base/SimpleText'
import CrudTextInput from '../../../CrudForm/CrudTextInput'
import FormatTable from './FormatTable'
import SimpleIcon from '../../../../Base/SimpleIcon'
import {v4 as uuid} from 'uuid'
import ValidationList from '../../../../ValidationList'
import Utility from '../../../../Base/Utility'
import Manager from '../../../../../Manager'
import { ReturnData } from './AddCompetitionPopup'
import { FormatData } from '../../../../../classes/CompetitionFormatData'
import useReload from '../../../../Base/useReload'
import DropdownButton from '../../../../../classes/DropdownButton'
const sharedConfig = require("../../../../../SharedConfig.json")
const {competition_format_name_format_message, competition_format_name_minlength, competition_format_name_maxlength, competition_format_name_expression, competition_format_position_minlength
, competition_format_position_maxlength, competition_format_position_expression, competition_format_position_format_message,
competition_format_output_minlength, competition_format_output_maxlength, competition_format_output_expression, competition_format_output_format_message} = sharedConfig

function newTableData(pos="", out=""){
    const tableData = {pos, out}
    tableData.key = uuid()
    tableData.showErrors = false
    tableData.getErrors = () =>{
        const errors = []
        const pos = tableData.pos.replace(/\s/g, "")
        const out = tableData.out
        //
        if (tableData.isEmpty())
            return errors
        if (pos.length < competition_format_position_minlength || pos.length > competition_format_position_maxlength){
            errors.push({msg: `Position must be between ${competition_format_position_minlength} and ${competition_format_position_maxlength} characters`, code: "pos_incorrect_length"})
        }
        if (out.length < competition_format_output_minlength || pos.length > competition_format_output_maxlength){
            errors.push({msg: `Output must be between ${competition_format_output_minlength} and ${competition_format_output_maxlength} characters`, code: "out_incorrect_length"})
        }
        if (competition_format_position_expression != null && !(new RegExp(competition_format_position_expression).test(pos))){
            errors.push({msg: competition_format_position_format_message, code: "pos_format_mismatch"})
        }
        if (competition_format_output_expression != null && !(new RegExp(competition_format_output_expression).test(out))){
            errors.push({msg: competition_format_output_format_message, code: "out_format_mismatch"})
        }
        return errors
    }
    tableData.isEmpty = () =>{
        return tableData.pos === "" && tableData.out === ""
    }
    tableData.print = () =>{
        
    }
    return tableData
}

const AddCompetitionExtention = ({goBack, editFormatData, selectedFormatName}) => {
    const isEdit = editFormatData != null
    const [formatData, setFormatData] = useState(isEdit ? editFormatData : new FormatData(""))
    const [canSave, setCanSave] = useState(true)
    const reload = useReload()
    const nameInput = useRef()
    useEffect(() =>{
        //document.getElementById("create-format-name-input").select()
        nameInput.current.select()
    }, [])

    useEffect(() =>{
        //tableData.forEach(data =>{
            //
            //data.getErrors()
       // })
        //
    })

    if (formatData.formatRows.length === 0)
        formatData.addRow("", "")

    const plusClick = () =>{
        formatData.addRow("", "")
        reload()
    }

    const removeClick = (index) =>{
        formatData.removeFormatRow(index)
        reload()
    }

    const getRowSymbol = (index) =>{
        const lastRow = index == formatData.formatRows.length - 1
        if (!lastRow && formatData.formatRows.length > 1)
            return (<SimpleIcon iconClassName="fa-solid fa-thin fa-xmark" title="Remove" onClick={() => {removeClick(index)}}/>)
        return (<SimpleIcon containerClassName="ft-symbol-plus" iconClassName="fa-regular fa-plus fa-solid" title="Add Row" onClick={plusClick}/>)
    }

    const onPosChange = (e, index) =>{
        formatData.errorCollection.getList("global").visible = false
        const fRow = formatData.formatRows[index]
        fRow.pos = e.target.value
        fRow.errorList.setVisible(false)
        reload()
    }

    const onOutChange = (e, index) =>{
        formatData.errorCollection.getList("global").visible = false
        const fRow = formatData.formatRows[index]
        fRow.out = e.target.value
        fRow.errorList.setVisible(false)
        reload()
    }

    const onNameChange = (e) =>{
        formatData.errorCollection.getList("global").visible = false
        formatData.name = e.target.value
        formatData.nameErrorList.setVisible(false)
        reload()
    }

    const saveClick = () =>{
        if (!canSave) return
        const legalFormats = formatData.getLegalFormats(true)
        /*if (legalFormats.length < 1){
            globalErrors = []
            globalErrors.push({msg: "You must enter at least one valid format", code: "error_no_formats"})
            isErrors = true
        }*/
        formatData.errorCollection.setAllVisible()
        /*if (legalFormats.length === 0){
            formatData.errorCollection.getList("global").appendError("There are no valid formats", "global_no_formats")
            reload()
            return
        }*/
        if (formatData.errorCollection.hasErrors())
        {
            reload()
            return
        }
        const name = Utility.formatText(formatData.name)
        const response = (errors) =>{
            if (!errors){
                //
                const returnData = new ReturnData("save")
                returnData.newSelectedFormatName = (formatData.ogName === selectedFormatName || !isEdit) ? formatData.name : selectedFormatName
                return goBack(returnData)
            }
            formatData.errorCollection.addServerCollection(errors)
            setCanSave(true)
            reload()
        }
        setCanSave(false)
        if (isEdit)
            Manager.editCompetitionFormat(formatData.ogName, name, legalFormats, response)
        else
            Manager.createCompetitionFormat(name, legalFormats, response)
    }

    const cancelClick = () =>{
        goBack(new ReturnData("cancel"))
    }


  return (
    <div id="add-competition-extention">
        <SimpleHeader text={!isEdit ? "Create Format" : `Edit Format (${formatData.ogName})`} fontSize="22px"/>
        <ValidationList validationMessages={formatData.errorCollection.getErrors("global")} className="simple-center"/>
        <div id="create-format-input-section">
            <div className="cfi-container">
                <label className="cfi-label" htmlFor="create-format-name-input">Name</label>
                <CrudTextInput onChange={onNameChange} inputRef={nameInput} id="create-format-name-input" value={formatData.name}/>
                <ValidationList validationMessages={formatData.nameErrorList.callErrors()}/>
            </div>
        </div>
        {/*<FormatTable />*/}
        <div id="format-table">
        <div className='format-table-row-container'>
            <div className='format-table-row'>
                <div className='ft-collumn-header ft-container ft-pos-container'>
                    <SimpleText text="Position" fontSize="16px"/>
                </div>
                <div className='ft-collumn-header ft-container ft-out-container'>
                    <SimpleText text="Output" fontSize="16px"/>
                </div>
            </div>
        </div>
        {formatData.formatRows.map((row, i) =>{
            return (
            <div key={row.key} className="format-table-row-container">
                <div className='format-table-row'>
                    <div className='ft-container ft-pos-container'>
                        <CrudTextInput value={row.pos} onChange={e => onPosChange(e, i)}/>
                    </div>
                    <div className='ft-container ft-out-container'>
                        <input className="crud-text-input" value={row.out} onChange={e => onOutChange(e, i)}/>
                    </div>
                    <div className='ft-container ft-symbol simple-center'>
                        {/*<SimpleIcon iconClassName="fa-solid fa-thin fa-xmark" title="Remove"/>*/
                        getRowSymbol(i)}
                    </div>
                </div>
                
                <ValidationList validationMessages={row.errorList.callErrors()}/>
            </div>)
        })}
    </div>
        <div id="create-format-buttons">
            <div className={Utility.joinClass("create-format-button save", canSave ? "active" : "")} onClick={saveClick}>
                <SimpleText text="Save"/>
            </div>
            <div className="create-format-button cancel" onClick={cancelClick}>
                <SimpleText text="Cancel"/>
            </div>
        </div>
    </div>
  )
}

AddCompetitionExtention.defaultProps = {
}

export default AddCompetitionExtention