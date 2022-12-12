import React, { useEffect, useState } from 'react'
import useReload from "./useReload"
import utility from "./Utility"
import SimpleText from "./SimpleText"
import ClickRegistry from './ClickRegistry'
import {v4 as uuid} from 'uuid'

const SimpleTextInput = ({input, inputClass, list, max, dir, postRender, maxHeight, itemHeight}) => {
    //let [itemList, setItemList] = useState([])
    const [direction, setDirection] = useState(dir)
    const [visible, setVisible] = useState(true)
    let [selectedName, setSelectedName] = useState(null)
    const [registryGroup] = useState(uuid())
    const reload = useReload()
    const reset = useReload(() =>{
        //setItemList([])
        setSelectedName(null)
    })

    const contentId = `SimpleTextInputContent_${input.inputId}`

    useEffect(() =>{
        postRender(contentId, maxHeight, setDirection)
    })


    ClickRegistry.addRegistry(registryGroup, input.inputId, contentId, "mousedown", (target, state) =>{
        //
        if (state === "other_click")
            setVisible(false)
    })
    
    const generateFreshList = (e) =>{
        if (input.value.search(/^\s*$/) != -1){
            return []
        }
        const newList = list.filter(name =>{
            return name !== input.value && name.replace(/\\/g, "\\\\").toLocaleLowerCase().search(input.value.replace(/\\/g, "\\\\").toLocaleLowerCase()) != -1
        })
        newList.sort((n1, n2) =>{
            if (n1.toLocaleLowerCase().search(new RegExp(`^${input.value.toLocaleLowerCase()}`)) != -1)
                return -1
            return 1
        })
        /*setItemList(Array.from(newList, (name, index) =>{
            if (index < max)
                return name
        }))*/
        const l = []
        for (let i = 0; i < newList.length; i++){
            if (i >= max)
                break
            l.push(newList[i])
        }
        return l
        //reload()
    }

    const freshList = generateFreshList()

    const predictItemClick = (e, name) =>{
        input.value = name
        reset()
    }

    const scrollToItem = (name, d) =>{
        const predictArea = document.getElementById(contentId)
        const itemElement = document.getElementById(`PredictItem_${input.inputId}_${name}`)
        const itemRect = itemElement.getBoundingClientRect()
        
        
        
        
        if (d === "up" && predictArea.scrollTop > itemElement.offsetTop){
            predictArea.scrollTop = itemElement.offsetTop
        } else if (d === "down" && (predictArea.scrollTop + predictArea.offsetHeight) < (itemElement.offsetTop + itemRect.height)){
            
            predictArea.scrollTop = itemElement.offsetTop - predictArea.offsetHeight + itemElement.offsetHeight
        }
    }

    const inputKeyDown = e =>{
        const legitKeys = ["ArrowUp", "ArrowDown", "Enter"]
        const itemList = freshList
        if (selectedName == null && e.key === "Enter"){
            input.onEnter()
            return
        }
        if (itemList[0] == null || !legitKeys.includes(e.key)) return
        e.preventDefault()
        const firstItemName = itemList[0]
        let selectedItemNameIndex = itemList.indexOf(selectedName)
        const nextName = itemList[selectedItemNameIndex + 1]
        const prevName = itemList[selectedItemNameIndex - 1]
        if (e.key === "Enter"){
            if (selectedName == null || selectedItemNameIndex === -1) return
            input.value = selectedName
            reset()
        } else if ((e.key === "ArrowUp") == (direction === "up")){
            if (selectedName == null){
                setSelectedName(firstItemName)
                scrollToItem(firstItemName, direction)
            }
            else if (nextName != null){
                setSelectedName(nextName)
                scrollToItem(nextName, direction)
            }
        } else if (prevName != null && selectedName != null){
            setSelectedName(prevName)
            scrollToItem(prevName, direction === "up" ? "down" : "up")
        }
    }

    const inputFocus = () =>{
        setVisible(true)
    }

    const inputChange = (e) =>{
        if (!freshList.includes(selectedName))
            setSelectedName(null)
        input.onChange(e)
    }
    //

    return (
    <div className="simple-text-input-container">
        <input id={input.inputId} className={inputClass} onChange={inputChange} value={input.value} onKeyDown={inputKeyDown} onFocus={inputFocus}/*onChange={input.onChange}*//>
        <div id={contentId} className={utility.joinClass(`base-thin-scrollbar predict-area${visible ? "" : " no-display"}`, direction)} style={{maxHeight: `${maxHeight}px`}}>
            {freshList.map((name, i) =>{
                return (<div key={name} id={`PredictItem_${input.inputId}_${name}`}className={`predict-area-item${name === selectedName ? ' predictable-selected' : ''}`} style={{}}onClick={(e) => predictItemClick(e, name)}>
                    <SimpleText text={name}/>
                </div>)
            })}
        </div>
    </div>
  )
}

SimpleTextInput.defaultProps = {
    list: [],
    onEnter: () => {},
    max: 8,
    dir: "up",
    postRender: () =>{

    },
    itemHeight: 37,
    maxHeight: 37 * 8
}

export default SimpleTextInput