import React from 'react'
import Manager from '../../../Manager'
import CompetitionBoard from './CompetitionBoard'

const CompetitionSection = () => {
    const competitions = Manager.getCompetitions()
  return (
    <div id="competition-section">
        {competitions.map((comp, i) =>{
            return (<CompetitionBoard key={comp.competitionId} competition={comp}/>)
        })}
    </div>
  )
}

export default CompetitionSection