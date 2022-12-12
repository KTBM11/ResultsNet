import React from 'react'
import SimpleIcon from '../../Base/SimpleIcon'
import SimpleText from '../../Base/SimpleText'
import {v4 as uuid} from 'uuid'

const DropdownOption = ({option, type, onClick, selected}) => {
    let iconButtons = (<></>)
    //
    /*if (option.removeClick){
        removeIcon = (<SimpleIcon iconClassName="fa-solid fa-thin fa-xmark icon-cross" containerClassName="rdo-icon-container" title={option.removeTitle} onClick={option.removeClick}/>)
    }
    if (option.editClick){
        editIcon = (<SimpleIcon iconClassName="fa-solid fa-pen dropdown-pen" containerClassName="rdo-icon-container" title={option.editTitle} onClick={option.editClick}/>)
    }*/

    if (option.buttons){
        iconButtons = option.buttons.map((button) =>{
            const iconClick = () =>{
                button.onClick(option)
            }
            return (
                <SimpleIcon key={uuid()} iconClassName={button.iconClass} containerClassName="rdo-icon-container" title={button.title} onClick={iconClick}/>)
        })
    }
    return (
        <div className={`results-dropdown-option-container${selected ? " selected" : ""}`}>
            <SimpleText text={option.text} fontSize="14px" onClick={onClick}/>
            {iconButtons}
        </div>
    )
}

DropdownOption.defaultProps = {
    selected: false,
}

export default DropdownOption