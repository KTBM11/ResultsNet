import React, {useState} from 'react'
import Manager from '../../Manager'
//import AddCareerPopup from '../ResultsPage/ResultsMenu/Popups/AddCareerPopup'
import TestPopup from '../ResultsPage/ResultsMenu/Popups/TestPopup'
import ClickRegistry from './ClickRegistry'
import Utility from './Utility'

const PopupManager = ({elementPopup, className}) => {
  ClickRegistry.removeByButtonId("popup-manager")
  if (elementPopup != null){
    const registryGroup = `popup-manager_${elementPopup.props.id}`
    ClickRegistry.addRegistry(registryGroup, "popup-manager", elementPopup.props.id, "mousedown", (target, state) =>{
      if (state == "direct_click"){
        ClickRegistry.removeGroup(registryGroup)
        Manager.ShowPopup(null)
      }
    })
  }

  return (
    <div id="popup-manager" className={Utility.joinClass(elementPopup == null ? "inactive" : "active", className)}>
        {[...Array(1)].map((x, i) =>{
            if (elementPopup == null) return       
            //return <AddCareerPopup /> 
            //console.log(elementPopup.props.id)
            return React.cloneElement(elementPopup, {key: i})
        })}
    </div>
  )
}

export default PopupManager