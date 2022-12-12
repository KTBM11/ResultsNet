import { DropdownOption } from "./DropdownOption";

class DropdownProp{
    options = [];
    buttons = [];
    header;
    selectedIndex;
    defaultTitle = "";
    onOptionSelect = () => true

    constructor(){

    }

    fromArray(arr, optionButtons=[]){
        this.reset()
        arr.forEach(item =>{
            const option = new DropdownOption()
            option.text = item
            option.value = item  
            optionButtons.forEach(button =>{
                option.addButton(button.title, button.iconClass, button.onClick)
            })
            this.addOption(option)
        })
    }

    reset(){
        this.options = []
        this.buttons = []
    }

    removeOption(optionValue){
        this.options.forEach((option, index) =>{
            if (optionValue === option.value){
                if (index == this.selectedIndex)
                    this.selectedIndex = null
                else if (index < this.selectedIndex)
                    this.selectedIndex--
                this.options.splice(index, 1)
            }
        })
    }

    addOption(option, selected=false){
        this.options.push(option)
        this.selectedIndex = selected ? this.options.length - 1 : this.selectedIndex
    }

    getOptions(){
        return this.options
    }

    getSelectedOption(){
        return this.options.find((option, i) =>{
            return this.selectedIndex === i
        })
    }

    getSelectedValue(){
        const sOption = this.getSelectedOption()
        if (sOption != null)
            return sOption.value
        return null
    }

    addButton(button){
        this.buttons.push(button)
    }

    firstOrDefault(def=null){
        if (this.initialSelectedValue)
            return this.initialSelectedValue
        if (this.options[0])
            return this.options[0].value
        return def
    }

    setSelectedFromValue(value){
        this.options.forEach((option, index) =>{
            if (index !== this.selectedIndex && option.value === value){
                this.selectedIndex = index
                this.onOptionSelect(option)
            } 
        })
    }

    optionFromValue(value){
        return this.options.find(option =>{
            return option.value === value
        })
    }

}

export default DropdownProp