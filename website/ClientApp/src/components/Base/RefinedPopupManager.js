import React, {useMemo, useState} from 'react'
import { PopupCollectionProp } from '../../classes/PopupCollectionProp'
import ClickRegistry from './ClickRegistry'

const RefinedPopupManager = ({popupCollectionProp, externalAccessor}) => {
    const [popupCollection, setPopupCollection] = useState(popupCollectionProp)
    const [bool, setBool] = useState(true)
    const reload = () =>{
        
        setBool(prevBool => !prevBool)
    } 

    useMemo(() =>{
        externalAccessor.closePopups = () =>{
            popupCollection.removeAll()
            reload()
        }
        externalAccessor.addPopup = (popupProp, makeSelected=false) => {
            popupCollection.addPopup(popupProp, makeSelected)
            reload()
        }
        externalAccessor.setSelectedPopup =  (id) =>{
            popupCollection.setSelectedPopup(id)
            reload()
        }
        externalAccessor.removePopup = (id) =>{
            popupCollection.removePopup(id)
            reload()
        }
    }, [externalAccessor])

    ClickRegistry.removeByButtonId("popup-manager-refined")
    const selectedPopup = popupCollection.getSelectedPopup()
    if (selectedPopup != null){
        const registryGroup = `popup-manager-refined_${selectedPopup.id}`
        ClickRegistry.addRegistry(registryGroup, "popup-manager-refined", `POPUP_MANAGER__${selectedPopup.id}`, "mousedown", (target, state) =>{
            if (state == "direct_click"){
                ClickRegistry.removeGroup(registryGroup)
                popupCollection.removeAll()
                reload()
            }
        })
    }
  return (
    <div id="popup-manager-refined" className={selectedPopup == null ? "inactive" : "active"}>
        {Object.keys(popupCollection.popups).map((key, i) =>{
            const component = popupCollection.popups[key]
            const isSelected = key == selectedPopup.id
            return (<div id={`POPUP_MANAGER__${key}`} key={key} className={isSelected ? "flex-display" : "no-display"}>
                {component}
            </div>)
        })}
    </div>
  )
}

RefinedPopupManager.defaultProps = {
    popupCollectionProp: new PopupCollectionProp()
}

export default RefinedPopupManager