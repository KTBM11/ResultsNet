import React from 'react'
import Manager from '../../../Manager'
import SimpleText from '../../Base/SimpleText'
import ResultsPanelSection from './ResultsPanelSection'
import SimpleIcon from "../../Base/SimpleIcon"
import useReload from "../../Base/useReload"

const getBackgroundColor = (result) =>{
    const diff = result.goalsFor - result.goalsAgaints
    if (diff >= 1){
        return "rgb(187, 243, 187)"
    } else if (diff === 0)
        return "rgb(255, 255, 187)"
    else
        return "rgb(255, 187, 187)"
}

const fontSize = "15.5px"

const ResultPanel = ({result, getPositionText, isDisabled}) => {
    const reload = useReload();
    const comp = Manager.getCompetition(result.competitionId)
    const teamName = Manager.getSelectedSeason().teamName
    const homeTeam = result.home ? teamName : result.oppTeam
    const awayTeam = result.home ? result.oppTeam : teamName
    const homeScore = result.home ? result.goalsFor : result.goalsAgaints
    const awayScore = result.home ? result.goalsAgaints : result.goalsFor

    const removeClick = () =>{
        if (isDisabled()) return
        
        Manager.removeResult(result, (errors) =>{
            if (!errors){
                Manager.reload()
                return
            }
        })

    }

    const getButtons = () =>{
        if (!Manager.hasPermission() || comp.concluded)
            return (<></>)
        return (<div key={'result-panel-buttons'} className='result-panel-buttons'>
            <SimpleIcon title="Remove Result" containerClassName="rs-icon-container" iconClassName="fa-solid fa-thin fa-xmark rs-remove" onClick={removeClick}/>
        </div>)
    }

  return (
    <div id={`ResultPanel_${result.resultId}`} className='result-panel' style={{backgroundColor: getBackgroundColor(result)}}>
        <ResultsPanelSection className="rp1">
            <SimpleText className={"rp-position-text"} text={result.replay ? "Replay" : getPositionText(result)} fontSize={fontSize}/>
        </ResultsPanelSection>
        <ResultsPanelSection className="rp2">
            <SimpleText className="rp-team-text" text={homeTeam} textAlign="right" fontSize={fontSize}/>
        </ResultsPanelSection>
        <ResultsPanelSection className="rp3">
           <SimpleText className text={`${homeScore}–${awayScore}`} fontSize={fontSize}/> 
        </ResultsPanelSection>
        <ResultsPanelSection className="rp4">
            <SimpleText className="rp-team-text" text={awayTeam} textAlign="left" fontSize={fontSize}/>
        </ResultsPanelSection>
        <ResultsPanelSection className="rp5">
            {getButtons()}
        </ResultsPanelSection>
    </div>
  )
}

export default ResultPanel