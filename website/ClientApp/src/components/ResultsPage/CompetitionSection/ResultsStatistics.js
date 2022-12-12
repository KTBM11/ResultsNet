import React from 'react'
import SimpleHeader from '../../Base/SimpleHeader'
import Manager from '../../../Manager'
import SimpleText from '../../Base/SimpleText'

const resultOutcome = (result) =>{
    if (result.goalsFor === result.goalsAgaints)
        return "Drew"
    else if (result.goalsFor > result.goalsAgaints)
        return "Won"
    else
        return "Lost"
}

const points = {
    "Drew": 1,
    "Lost": 0,
    "Won": 3
}

const isCleanSheet = (result) =>{
    return result.goalsAgaints === 0 ? 1 : 0
}

const goalDifference = (result) =>{
    if (!result) return null
    return result.goalsFor - result.goalsAgaints
}

const generateStatistics = (compId) =>{
    const results = Manager.getResults(compId)
    const stats = {
        "Games Played": results.length,
        "Won": 0,
        "Drew": 0,
        "Lost": 0,
        "Points": 0,
        "Goals": 0,
        "Goals per Game": 0,
        "Goals Against": 0,
        "Goals Against per Game": 0,
        "Clean Sheets": 0,
        "Biggest Victory": [],
        "Biggest Defeat": [],
    }

    let biggestWs = []
    let biggestLs = []
    results.forEach(result => {
        const outcome = resultOutcome(result)
        stats[outcome]++
        stats["Points"] += points[outcome]
        stats["Goals"] += result.goalsFor
        stats["Goals Against"] += result.goalsAgaints 
        stats["Clean Sheets"] += isCleanSheet(result)

        const currentWDiff = goalDifference(biggestWs[0])
        const currentLDiff = goalDifference(biggestLs[0])
        const gDiff = goalDifference(result)
        if (gDiff >= 1 && !currentWDiff)
            biggestWs.push(result)
        else if (currentWDiff && gDiff >= currentWDiff){
            if (gDiff > currentWDiff) 
                biggestWs = []
            biggestWs.push(result)
        } else if (gDiff <= -1 && !currentLDiff)
            biggestLs.push(result)
        else if (currentLDiff && gDiff <= currentLDiff){
            if (gDiff < currentLDiff)
                biggestLs = []
            biggestLs.push(result)
        }
    });

    const gpg = stats["Goals"] / stats["Games Played"]
    stats["Goals per Game"] = isNaN(gpg) ? 0 : gpg.toFixed(2)
    const gapg = stats["Goals Against"] / stats["Games Played"]
    stats["Goals Against per Game"] = isNaN(gapg) ? 0 : gapg.toFixed(2)

    const biggestVictory = Array.from(biggestWs, (result) =>{
        return `${result.goalsFor}–${result.goalsAgaints} (vs ${result.oppTeam})`
    })
    stats["Biggest Victory"] = (biggestVictory.length === 0) ? "N/A" : biggestVictory

    const biggestDefeat = Array.from(biggestLs, (result) =>{
        return `${result.goalsFor}–${result.goalsAgaints} (vs ${result.oppTeam})`
    })
    stats["Biggest Defeat"] = (biggestDefeat.length === 0) ? "N/A" : biggestDefeat
     return stats
}

const getStatValue = (stat) =>{
    if (Array.isArray(stat)){
        return stat.map(s =>{
            return (<SimpleText text={s} textAlign="right" fontSize="15.5px"/>)
        })
    }
    return <SimpleText text={stat} textAlign="right" fontSize="15.5px"/>
}

const ResultsStatistics = ({competition}) => {
    const stats = generateStatistics(competition.competitionId)
  return (
    <div className='results-statistics'>
        <SimpleHeader text="Summary" fontWeight="600" padding="10px"/>
        <div className="stats-table">
            {Object.keys(stats).map(key =>{
                return (<div className='stat-row'>
                    <div className='stat-collumn left'>
                        <SimpleText text={key} fontSize="15.5px"/>
                    </div>
                    <div className='stat-collumn right'>{getStatValue(stats[key])}</div>
                </div>)
            })}
        </div>
    </div>
  )
}

export default ResultsStatistics