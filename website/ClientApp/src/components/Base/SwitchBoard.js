import React, { useEffect, useRef } from 'react'
import {v4 as uuid} from 'uuid'
import useReload from './useReload';
import Utility from './Utility';

export class SwitchItem{
    id;
    value;
    component;
    constructor(_value, _component, _id=`SwitchItem_${uuid()}`){
        this.id = _id
        this.value = _value
        this.component = _component
        if (!this.component)
            this.component = (<div className='switch-item-inner'>{this.value}</div>)
    }

    getElement(){
        return document.getElementById(this.id)
    }
}

export class SwitchCollection{
    switchItems = [];
    switchItemsCopy= [];
    activeItem;
    itemHeight;
    clientMouseY = 0;
    tested=false;
    disabled = false;
    exemptSelectors = [];
    canSwitchItem = () =>{
        return true
    };
    id;
    onItemShifted = (undo, confirm) => confirm()
    onItemsReordered = () =>{

    }

    constructor(_h, _id=`SwitchCollection_${uuid()}`){
        this.itemHeight = _h
        this.id=_id
    }

    getTotalHeight(){
        return this.switchItems.length * this.itemHeight
    }

    pxTotalHeight(){
        return `${this.getTotalHeight()}px`
    }

    getItem(index){
        return this.switchItems(index)
    }

    getItems(){
        return this.switchItems
    }

    addItem(_item){
        this.switchItems.push(_item)
    }

    addItems(){
        for (let i = 0; i < arguments.length; i++){
            this.addItem(arguments[i])
        }
    }

    fromValues(){
        for (let i = 0; i < arguments.length; i++){
            this.addItem(new SwitchItem(arguments[i]))
        }
    }

    getItemTop(itemIndex){
        return itemIndex * this.itemHeight
    }

    pxItemTop(itemIndex){
        return `${this.getItemTop(itemIndex)}px`
    }

    pxItemHeight(){
        return `${this.itemHeight}px`
    }

    getActiveElement(){
        if (!this.activeItem) return null
        return this.activeItem.getElement()
    }

    setActiveItem(itemIndex){
        this.switchItems.forEach((item, i) =>{
            const element = item.getElement()
            if (itemIndex === i){
                this.activeItem = item
                this.activeItem.startingIndex = i
                element.style.zIndex = "2"
                return
            }
            element.style.zIndex = "1"
        })
    }

    itemMouseDown(item, e){
        if (this.disabled || !this.canSwitchItem()) return
        for (let i = 0; i < this.exemptSelectors.length; i++){
            const selector = this.exemptSelectors[i]
            if (e.target.closest(selector))
                return
        }
        
        e.preventDefault()
        this.switchItemsCopy = [...this.switchItems]
        const itemIndex = this.findItemIndex(item)
        const switchItem = item
        this.setActiveItem(itemIndex)
        const switchElement = this.getActiveElement()
        //
        switchElement.style.zIndex = "2"
        this.clientMouseY = e.clientY

        document.onmouseup = this.closeDrag.bind(this)
        document.onmousemove = this.elementDrag.bind(this)
    }

    indexFromMouse(){
        const container = document.getElementById(this.id)
        const relativeMouseY = this.clientMouseY - container.getBoundingClientRect().top
        return Math.min(this.switchItems.length, Math.max(0, Math.floor(relativeMouseY / this.itemHeight)))
    }

    mouseInContainer(){
        const container = document.getElementById(this.id)
        const relativeMouseY = this.clientMouseY - container.getBoundingClientRect().top
        return relativeMouseY > 0 && relativeMouseY < container.getBoundingClientRect().height
    }

    elementDrag(e){
        //
        if (!this.activeItem) return
        e.preventDefault()
        const activeElement = this.getActiveElement()  
        const elementOffsetY = this.clientMouseY - e.clientY
        this.clientMouseY = e.clientY
        if (!this.mouseInContainer()) return
        activeElement.style.top = `${activeElement.offsetTop - elementOffsetY}px`

        const activeIndex = this.findItemIndex(this.activeItem)
        const mouseIndex = this.indexFromMouse()
        if (mouseIndex !== activeIndex && !this.tested){
            //this.setItemToPosition(mouseIndex, activeIndex)
            this.reorderItems(mouseIndex)
        }

    }

    setItemToPosition(itemIndex, newIndex){
        const switchItem = this.switchItems[itemIndex]
        const switchElement = switchItem.getElement()
        switchElement.style.top = `${this.itemHeight*newIndex}px`
        this.tested = true
    }

    findItemIndex(item, items=this.switchItems){
        return items.findIndex(_switchItem =>{
            return item.id === _switchItem.id
        })
    }

    isDisabled = () =>{
        return this.disabled
    }

    reEnable = () =>{
        window.setTimeout(() =>{
            this.disabled = false;
        }, 500)
    }

    closeDrag(){
        if (!this.activeItem) return
        document.onmousemove = null
        document.onmouseup = null

        const activeIndex = this.findItemIndex(this.activeItem)
        const activeElement = this.getActiveElement()
        //
        activeElement.style.top = `${this.itemHeight * activeIndex}px`
        this.disabled = true

        const undo = () =>{
            this.switchItems = this.switchItemsCopy
            this.sendItemsHome()
            this.reEnable()
            this.onItemsReordered(this.switchItems)
        }

        const confirm = () =>{
            this.reEnable()
        }
        if (activeIndex === this.findItemIndex(this.activeItem, this.switchItemsCopy)){
            this.disabled = false
            //
            return
        }
        this.onItemShifted(undo, confirm, this.activeItem, activeIndex)
        this.activeItem = null
    }

    sendItemsHome(){ // send em back where they came from
        this.switchItems.forEach((item, index) =>{
            if (this.activeItem && this.activeItem.id === item.id) return
            item.getElement().style.top = `${this.itemHeight * index}px`
        })
    }

    reorderItems(newActiveIndex){
        const activeIndex = this.findItemIndex(this.activeItem)
        if (newActiveIndex === activeIndex) return
        //
        this.switchItems.splice(this.findItemIndex(this.activeItem), 1)
       // if (activeIndex < newActiveIndex){
            this.switchItems.splice(newActiveIndex, 0, this.activeItem)
        //} else {
        //    this.switchItems.splice()
        //}
        //
        this.sendItemsHome()
        this.onItemsReordered(this.switchItems)
        //this.reload()
    }

}

const SwitchBoard = ({className, switchCollection}) => {
    const reload = useReload()
    switchCollection.reload = reload
    const lastHeight = useRef(switchCollection.getTotalHeight())
    const currentHeight = switchCollection.getTotalHeight()
    let transitionDuration = "0.5s"
    if (lastHeight.current < currentHeight){
        transitionDuration = "0s"
    }
    lastHeight.current = currentHeight
    /*useEffect(() =>{
        
    })*/
    const canSwitch = switchCollection.canSwitchItem()
  return (
    <div className={Utility.joinClass('switch-board', className)} id={switchCollection.id} style={{height: switchCollection.pxTotalHeight(), transitionDuration}}>
        {switchCollection.getItems().map((item, i) =>{
            //
            return (<div key={item.component.key} id={item.id} className={`${canSwitch ? "can-switch-item " : ""}switch-item`} style={{top: switchCollection.pxItemTop(i), height: switchCollection.pxItemHeight()}} onMouseDown={switchCollection.itemMouseDown.bind(switchCollection, item)}>
                {item.component}
            </div>)
        })}
    </div>
  )
}

export default SwitchBoard