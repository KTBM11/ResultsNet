import {v4 as uuid} from 'uuid'
import CrudError, { CrudErrorCollection, CrudErrorList } from './CrudError';
const sharedConfig = require("../SharedConfig.json")
const {competition_format_name_format_message, competition_format_name_minlength, competition_format_name_maxlength, competition_format_name_expression, competition_format_position_minlength
    , competition_format_position_maxlength, competition_format_position_expression, competition_format_position_format_message,
    competition_format_output_minlength, competition_format_output_maxlength, competition_format_output_expression, competition_format_output_format_message} = sharedConfig

export class FormatRow{
    pos;
    out;
    key = uuid();
    showErrors = false;
    errorList;
    constructor(_pos, _out){
        this.pos = _pos
        this.out = _out
        this.errorList = new CrudErrorList(this.key)
        this.errorList.validation = eList =>{
            const posText = this.pos.replace(/\s/g, "")
            
            
            if (this.isEmpty())
                return
            if (posText.length < competition_format_position_minlength || posText.length > competition_format_position_maxlength){
                eList.addError(new CrudError(`Position must be between ${competition_format_position_minlength} and ${competition_format_position_maxlength} characters`, "pos_incorrect_length"))
            }
            if (this.out.length < competition_format_output_minlength || this.out.length > competition_format_output_maxlength){
                eList.addError(new CrudError(`Output must be between ${competition_format_output_minlength} and ${competition_format_output_maxlength} characters`, "out_incorrect_length"))
            }
            if (competition_format_position_expression != null && !(new RegExp(competition_format_position_expression).test(posText))){
                eList.addError(new CrudError(competition_format_position_format_message, "pos_format_mismatch"))
            }
            if (competition_format_output_expression != null && !(new RegExp(competition_format_output_expression).test(this.out))){
                eList.addError(new CrudError(competition_format_output_format_message, "out_format_mismatch"))
            }
            
        }
    }

    isEmpty(){
        const posText = this.pos.replace(/\s/g, "")
        const outText = this.out.replace(/\s/g, "")
        return posText === "" && outText === ""
    }

    getErrors(){
        const errors = []
        const posText = this.pos.replace(/\s/g, "")
        if (this.isEmpty())
            return []
        if (posText.length < competition_format_position_minlength || posText.length > competition_format_position_maxlength){
            errors.push(new CrudError(`Position must be between ${competition_format_position_minlength} and ${competition_format_position_maxlength} characters`, "pos_incorrect_length"))
        }
        if (this.out.length < competition_format_output_minlength || this.out.length > competition_format_output_maxlength){
            errors.push(new CrudError(`Output must be between ${competition_format_output_minlength} and ${competition_format_output_maxlength} characters`, "out_incorrect_length"))
        }
        if (competition_format_position_expression != null && !(new RegExp(competition_format_position_expression).test(posText))){
            errors.push(new CrudError(competition_format_position_format_message, "pos_format_mismatch"))
        }
        if (competition_format_output_expression != null && !(new RegExp(competition_format_output_expression).test(this.out))){
            errors.push(new CrudError(competition_format_output_format_message, "out_format_mismatch"))
        }
        return errors
    }

    print(){
        
    }
}

export class FormatData{
    ogName;
    name = "";
    nameErrorList = new CrudErrorList("format_data_name")
    showNameErrors = false;
    showGlobalErrors = false;
    formatRows;
    serverErrors = [];
    errorCollection = new CrudErrorCollection()
    constructor(_name, _formatRows=[]){
        this.ogName = _name
        this.name = _name
        this.formatRows = _formatRows
        this.errorCollection.addErrorList(this.nameErrorList)
        const globalErrorList = new CrudErrorList("global")
        globalErrorList.validation = (eList) =>{
            if (this.getLegalFormats().length === 0){
                eList.appendError("There are no valid formats", "global_no_formats")
            }
        }
        this.errorCollection.addErrorList(globalErrorList)

        this.nameErrorList.validation = eList =>{
            if (this.name.length < competition_format_name_minlength || this.name.length > competition_format_name_maxlength)
                eList.addError(new CrudError(`Name must be between ${competition_format_name_minlength} and ${competition_format_name_maxlength} characters`, "name_incorrect_length"))
            if (competition_format_name_expression != null && !(new RegExp(competition_format_name_expression).test(this.name)))
                eList.addError(new CrudError(competition_format_name_format_message, "name_format_mismatch"))
        }
    }

    addRow(pos, out){
        const formatRow = new FormatRow(pos, out)
        this.errorCollection.addErrorList(formatRow.errorList)
        this.formatRows.push(formatRow)
    }

    removeFormatRow(index){
        this.formatRows.splice(index, 1)
    }

    getNameErrors(){
        const errors = []
        if (this.name.length < competition_format_name_minlength || this.name.length > competition_format_name_maxlength)
            errors.push(new CrudError(`Name must be between ${competition_format_name_minlength} and ${competition_format_name_maxlength} characters`, "name_incorrect_length"))
        if (competition_format_name_expression != null && !(new RegExp(competition_format_name_expression).test(this.name)))
            errors.push(new CrudError(competition_format_name_format_message, "name_format_mismatch"))
        this.serverErrors.forEach(error =>{
            if (/^format_name(?=_)/.test(error.code)){
                errors.push(new CrudError(error.msg, error.code))
            }
        })
        
        return errors
    }

    getGlobalErrors(){
        const errors = []
        if (this.getLegalFormats().length === 0){
            errors.push(new CrudError("You must enter at least one valid format", "error_no_formats"))
        }
        return errors   
    }

    getLegalFormats(highlightIllegal){
        const legalFormats = []
        this.formatRows.forEach(fmat =>{
            if (highlightIllegal && fmat.errorList.hasErrors()){
                fmat.errorList.visible = true
            } else if (!fmat.errorList.hasErrors() && !fmat.isEmpty()){
                fmat.pos = fmat.pos.replace(/\s/g, "")
                legalFormats.push(fmat)
            }
        })
        return legalFormats
    }



}