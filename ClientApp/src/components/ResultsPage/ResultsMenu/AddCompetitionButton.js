import React from 'react'
import { PopupProp } from '../../../classes/PopupCollectionProp'
import Manager from '../../../Manager'
import SimpleIcon from '../../Base/SimpleIcon'
import SimpleText from '../../Base/SimpleText'
import AddCompetitionPopup from './Popups/AddCompetition/AddCompetitionPopup'

const AddCompetitionButton = () => {
    const onClick = () =>{
      
      Manager.popup.addPopup(new PopupProp("add-competition-popup", (<AddCompetitionPopup/>)))
      //Manager.ShowPopup((<AddCompetitionPopup />))
    }

  return (
    <div id="add-competition-button" onClick={onClick}>
        <SimpleIcon iconClassName="fa-regular fa-plus fa-solid" containerClassName="comp-button-plus"/>
        <SimpleText text="ADD COMPETITION" fontFamily="Noto Sans Jp"/>
    </div>
  )
}

export default AddCompetitionButton