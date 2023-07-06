import {DropdownOption} from "./DropdownOption";
import DropdownProp from "./DropdownProp";
import CrudError, { CrudErrorList } from "./CrudError";

class CrudInput{
    title = "Input";
    inputId;
    errors = [];
    errorList;
    value;
    shouldFocus = true; // should the input focus upon crud form rendering
    onChange = () => {};
    onEnter = () => {};
    enterSubmit = false;
    type;

    constructor(_inputId, _type="CrudInput"){
        this.inputId = _inputId
        this.errorList = new CrudErrorList(_inputId)
        this.type = _type
    }

    addError(msg, code){
        //this.errors.push(new CrudError(msg, code))
        this.errorList.appendError(msg, code)
    }

    clearErrors(){
        this.errors = []
    }

    setValidation(_validation){
        this.errorList.validation = _validation
    }

    getType(){
        return this.type
    }
}

export class CrudPasswordInput extends CrudInput{
    constructor(_inputId){
        super(_inputId, "CrudPasswordInput")
        this.value = ""
    }
}

class CrudDropdownInput extends CrudInput{
    dropdownProp = new DropdownProp()
    constructor(_inputId){
        super(_inputId, "CrudDropdownInput")
        this.dropdownProp.onOptionSelect = (selectedOption) =>{
            if (this.onChange(selectedOption)){
                this.value = selectedOption.value
                return true
            }
        return false
        }
    }
    /*onOptionSelect(selectedOption){
        if (typeof(this.onChange) !== "function") return true
        
        if (this.onChange(selectedOption)){
            this.value = selectedOption.value
            return true
        }
        return false
    }*/

    addOption(option){
        this.dropdownProp.addOption(option)
    }

    addButton(button){
        this.dropdownProp.addButton(button)
    }
}

class CrudNumberInput extends CrudInput{
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
    integerOnly = false;

    constructor(_inputId){
        super(_inputId, "CrudNumberInput")
    }

    canInput(input){ // only checks whether user can input character in, is not for if their final input is valid
        let regexp
        if (this.integerOnly){
            regexp = this.min < 0 ? /^-?\d+$/ : /^\d+$/
        } else{
            regexp = this.min < 0 ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/
        }
        if (Number.isInteger(Number(input)) && Number(input) > this.max)
            return false
        return input === "" || regexp.test(input)
    }

    validInput(){
        const num = parseFloat(this.value)
        return !isNaN(num) && (Number.isInteger(num) || !this.integerOnly) && num >= this.min && num <= this.max
    }
}

export {CrudInput, CrudNumberInput, CrudDropdownInput}