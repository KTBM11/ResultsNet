import React from 'react'
import SimpleText from '../../Base/SimpleText'

const DropdownButtonElement = ({button, onClick}) => {
    return (
        <div className="rdo-button-container" onClick={onClick}>
            <SimpleText text={button.text} fontSize="14px" color="#1F85DE"/>
        </div>
    )
}

DropdownButtonElement.defaultProps = {
    selected: false,
}

export default DropdownButtonElement