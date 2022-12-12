import {v4 as uuid} from 'uuid';

export class PopupProp{
    id;
    component;
    constructor(_id, _component){
        this.id = _id
        this.component = _component
    }
}

export class PopupCollectionProp{
    popups = {}; // key == id, value = popupComponent;
    selectedPopupId;
    constructor(){

    }

    getLength(){
        return Object.keys(this.popups).length
    }

    addPopup(popupProp, makeSelected=false){
        this.popups[popupProp.id] = popupProp.component
        if (this.getLength() == 1 || makeSelected)
            this.selectedPopupId = popupProp.id
    }

    removePopup(id){
        this.popups[id] = undefined
        if (this.selectedPopupId == id)
            this.setDefaultSelected() 
    }

    setSelectedPopup(id){
        if (Object.keys(this.popups).includes(id)){
            this.selectedPopupId = id
        }
    }

    setDefaultSelected(){
        this.selectedPopupId = Object.keys(this.popups)[0]
    }

    removeAll(){
        this.popups = {}
        this.selectedPopupId = null
    }

    getSelectedPopup(){
        if (this.selectedPopupId == null) return null
        return new PopupProp(this.selectedPopupId, this.popups[this.selectedPopupId])
    }
}