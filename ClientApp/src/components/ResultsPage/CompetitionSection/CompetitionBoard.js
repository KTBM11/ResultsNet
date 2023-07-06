import React from 'react'
import Manager from '../../../Manager'
import ResultsSection from './ResultsSection'
import ResultsStatistics from './ResultsStatistics'

const CompetitionBoard = ({competition}) => {
  const statistics = () =>{
    if (competition.minimized){
      return (<></>)
    }
    return (<ResultsStatistics competition={competition}/>)
  }
  return (
    <div id={`CompetitionBoard_${competition.competitionId}`} className={`competition-board${competition.concluded ? " concluded" : ""}${competition.minimized ? " minimized" : ""}`}>
        <ResultsSection competition={competition}/>
        {statistics()}
    </div>
  )
}

export default CompetitionBoard