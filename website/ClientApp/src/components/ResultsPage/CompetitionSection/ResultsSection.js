import React, { useEffect } from 'react'
import { PopupProp } from '../../../classes/PopupCollectionProp'
import Manager from '../../../Manager'
import SimpleHeader from '../../Base/SimpleHeader'
import SimpleIcon from '../../Base/SimpleIcon'
import SimplePrompt from '../../Base/SimplePromp'
import SimpleSlider from '../../Base/SimpleSlider'
import SimpleText from '../../Base/SimpleText'
import useReload from '../../Base/useReload'
import AddCompetitionPopup, {EditCompetitionData} from '../ResultsMenu/Popups/AddCompetition/AddCompetitionPopup'
import ResultsBoard from './ResultsBoard'

const ResultsSection = ({competition}) => {

    useEffect(() =>{
        const compBoard = document.getElementById(`CompetitionBoard_${competition.competitionId}`)
        const header = compBoard.querySelector(".competition-header")
        const lastResultPanel = compBoard.querySelector(`.switch-item:last-child > .result-panel`)
        
        
        

        const boardBottom = compBoard.getBoundingClientRect().bottom
        if (lastResultPanel && boardBottom - lastResultPanel.getBoundingClientRect().bottom < 2){
            lastResultPanel.style.borderBottom = "0"
        } else if (lastResultPanel){
            lastResultPanel.style.borderBottom = "1px solid grey"
        } else if (competition.minimized && competition.concluded){
            header.style.borderBottom = "0"
        } else {
            header.style.borderBottom = "1px solid #000"
        }

    })

    const reload = useReload()

    const editCompetitionClick = () =>{
        Manager.popup.addPopup(new PopupProp("add-competition-popup", (<AddCompetitionPopup editData={new EditCompetitionData(competition)}/>)))
    }

    const removeCompYes = function(){
        
        Manager.removeCompetition(competition.competitionId, (success) =>{
            if (!success) return
            Manager.popup.closePopups()
            Manager.reload()
        })
    }

    const removeCompNo = function(){
        Manager.popup.closePopups()
    }
    
    const removeCompetitionClick = () =>{
        Manager.popup.addPopup(new PopupProp("remove-competition-prompt", (<SimplePrompt title={`Are you sure you want to remove this competition? (${competition.name})`}
        yesClick={removeCompYes} noClick={removeCompNo} id="remove-competition-prompt"/>)))
    }

    const concludeSliderClick = (updateChecked) =>{
        Manager.editCompetition(competition.name, competition.formatName, competition.startAt, competition.competitionId, true, false, (errors) =>{
            if (!errors){
                updateChecked()
                Manager.reload()
            }
        })
    }

    const getHeaderButtonsRight = () =>{
        if (!Manager.hasPermission())
            return (<></>)
        return (<div className='comp-button-wrapper'>
            <SimpleSlider isChecked={competition.concluded} checkedTitle="Open Competition" notCheckedTitle="Conclude Competition" onClick={concludeSliderClick}/>
                <SimpleIcon containerClassName={"ch-icon-container"} iconClassName="fa-solid fa-pen ch-icon-edit" title="Edit Competition" onClick={editCompetitionClick}/>
                <SimpleIcon containerClassName="ch-icon-container" iconClassName="fa-solid fa-thin fa-xmark ch-icon-remove" title="Remove Competition" onClick={removeCompetitionClick}/>
            </div>)
    }

    const showStatsClick = () =>{
        Manager.minimizeCompetition(competition, (errors) =>{
            if (!errors){
                Manager.reload()
            }
        })
    }

    const getHeaderButtonsLeft = () =>{
        return (<div className="comp-button-wrapper">
            <SimpleIcon containerClassName="ch-icon-container minimize-icon-container" iconClassName={`fa-solid ${competition.minimized ? "fa-plus" : "fa-minus"} ch-icon-plusminus`} title={`${competition.minimized ? "Show" : "Hide"} Stats`} onClick={showStatsClick}/>
        </div>)
    }

  return (
    <div className='results-section'>
        <div className='competition-header'>
            <div className='ch-left'>
                {getHeaderButtonsLeft()}
            </div>
            <div className='ch-center'>
                <SimpleText text={competition.name} fontWeight="600"/>
            </div>
            <div className='ch-right'>
                {getHeaderButtonsRight()}
            </div>
        </div>
        <ResultsBoard competitionId={competition.competitionId} showStats={competition.minimized}/>
    </div>
  )
}

export default ResultsSection