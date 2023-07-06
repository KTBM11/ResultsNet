import React, { useState, useRef, useEffect } from 'react'
import {v4 as uuidv4} from 'uuid'
import Arrows from '../../Arrow/Arrow';
import ClickRegistry from '../../Base/ClickRegistry';
import SimpleText from '../../Base/SimpleText';
import DropdownOption from './DropdownOption';
import Utility from '../../Base/Utility';
import DropdownButtonElement from './DropdownButtonElement';

const ResultsDropdown = ({className, dropProp, defaultSelectedIndex, bother}) => {
    //option == {text, value, type, removeTitle, removeClick, editTitle, editClick}
    const [contentVisible, setContentVisible] = useState(false)
    //const [selectedValue, setSelectedValue] = useState(dropProp.initialSelectedValue)

    //let selectedOptionIndex = defaultSelectedIndex
    const isMounted = useRef(false)

    useEffect(() =>{
        isMounted.current = true
        return () => {isMounted.current = false}
    }, [])

    const clickGroupId = useRef(uuidv4())
    const buttonId = useRef(`dropdown-button_${uuidv4()}`)
    const contentId = useRef(`dropdown-content${uuidv4()}`)
    if (!bother) return  (<></>)// why bother if there is no selected career
    ClickRegistry.removeGroup(clickGroupId.current)
    ClickRegistry.addRegistry(clickGroupId.current, buttonId.current, contentId.current, "click", (target, state) =>{
        /*
        
        
        */
        if (!isMounted.current) return
        if (state === "content_click")   
            return
        else if (state === "direct_click")
            setContentVisible(!contentVisible)
        else if (contentVisible)
            setContentVisible(false)
    })

    /*const getSelectedOption = () =>{
        return dropProp.options.find(option =>{
            return option.value === selectedValue
        })
    }*/

    const getSelectedText = (ifNull=dropProp.defaultTitle) =>{
        const selected = dropProp.getSelectedOption()
        if (selected)
            return selected.text
        return ifNull
    }

    const handleOptionClick = (index) =>{
        if (index === dropProp.selectedIndex) return
        if (!dropProp.onOptionSelect || dropProp.onOptionSelect(dropProp.options[index])){
            //setSelectedValue(clickedOption.value)
            dropProp.selectedIndex = index
            //dropProp.setSelectedFromValue
        }
        setContentVisible(false)
    }

    let headerDiv = (<></>)
    if (dropProp.header)
        headerDiv = (<SimpleText text={dropProp.header} fontFamily="Noto Sans Jp" fontWeight="300" fontStyle="italic" color="rgb(150, 60, 255)" fontSize="14px"/>)
  return (
    <div className={Utility.joinClass(`results-dropdown-container ${contentVisible ? "active" : "inactive"}`, className)}>
        <div id={buttonId.current} className="results-dropdown-button">
            <div className="rdb-title-area">
                <div className="rdb-header">
                    {headerDiv}
                </div>
                <div className='rdb-title'>
                    {/*<SimpleText text={getSelectedText()} fontFamily="Noto Sans Jp" fontWeight="500" fontSize="17px"/>*/}
                    <p className="simple-text" style={{fontFamily: "Noto Sans Jp", fontWeight: "500", fontSize: "17px"}} title={getSelectedText()}>{getSelectedText()}</p>
                </div>
            </div>
            <Arrows triangleWidth="10px"/>
        </div>
        <div id={contentId.current} className="results-dropdown-content">
            {dropProp.options.map((option, index) =>{
                return (<DropdownOption option={option} key={option.value} onClick={() => {handleOptionClick(index)}} selected={index === dropProp.selectedIndex}/>)
            })}
            {dropProp.buttons.map(button =>{
                return (<DropdownButtonElement button={button} key={uuidv4()} onClick={button.onClick}/>)
            })}
        </div>
    </div>
  )
}

ResultsDropdown.defaultProps = {
    bother: true,
    header: "Header",
    defaultSelectedIndex: 0,
    defaultTitle: "No Title",
    options: [
        {text: "Option 1", value: "goption1", type: "editable"},
        {text: "Option 2", value: "goption2",type: "editable"},
        {text: "Option 3", value: "goption3", type: "editable"},
        {text: "Option 4", value: "goption4", type: "editable"},
        {text: "Add Option", value: "", type: "button", onClick :() => {}}
    ],
    onSelect: (option) =>{
        
        return true
    }
}

export default ResultsDropdown