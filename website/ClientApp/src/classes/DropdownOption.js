class OptionButton{
    title;
    onClick;
    iconClass;

    constructor(title, iconClass, onClick){
        this.title = title
        this.iconClass = iconClass
        this.onClick = onClick
    }
}

class DropdownOption{
    text = "";
    value = "";
    buttons = [];

    constructor(_text="", _value=""){
        this.text = _text
        this.value = _value
    }

    addButton(title, iconClass, onClick){
        this.buttons.push(new OptionButton(title, iconClass, onClick))
    }
}

export {DropdownOption, OptionButton}