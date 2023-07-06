import React, { useState } from 'react'
import Manager from '../../../Manager'
import SwitchBoard, { SwitchCollection, SwitchItem } from '../../Base/SwitchBoard'
import ResultPanel from './ResultPanel'
import { AddResult } from './AddResult'
import useReload from '../../Base/useReload'

const ResultsBoard = ({competitionId}) => {
  const reload = useReload()
  //const [switchCollection] = useState(new SwitchCollection(28, `SwitchCllection_${competitionId}`))
  /* precedence
    1. [1], [2], [24], ^\d+$ 
    2. [1, 2, 8], [10,12,17], ^\d+(?=(,\d+)*$)
    3. [1-6], [7-8], [19-38], (^\d+-\d+$)
    4. [*] every position matches 
  */
  const positionExpressions = [/^\d+$/, /^\d+(?=(,\d+)*$)/, /^\d+-\d+$/, /.*/]
  const competitionFormats = Manager.getCompetitionFormat(competitionId);
  const comp = Manager.getCompetition(competitionId)
  const getPositionText = (result) =>{
    //
    let position = result.position + result.offset + comp.startAt - 1
    let lowestIndex = 4
    let chosenFormat;
   // 
    competitionFormats.formatRows.forEach(format =>{
        const fIndex = positionExpressions.findIndex(exp =>{
          return exp.test(format.pos)
        })
        let positionMatches = false
        switch(fIndex){
          case 0:
            positionMatches = new RegExp(`^${position}$`).test(format.pos)
            break
          case 1:
            positionMatches = new RegExp(`${position}`).test(format.pos)
            break
          case 2:
            const min = Number(new RegExp("^\\d+").exec(format.pos)[0])
            const max = Number(new RegExp("\\d+$").exec(format.pos)[0])
            positionMatches = position >= min && position <= max
            break
          case 3:
            positionMatches = true
            break
        }
        //
        if (positionMatches && fIndex < lowestIndex){
          lowestIndex = fIndex
          chosenFormat = format
        }
    })
   // 

    return chosenFormat ? chosenFormat.out.replace("[P]", position) : position
  }

    const results = Manager.getResults(competitionId)
    const switchCollection = new SwitchCollection(28, `SwitchCollection_${competitionId}`)
    switchCollection.exemptSelectors.push(".result-panel-buttons")
    switchCollection.canSwitchItem = () =>{
      return Manager.hasPermission() && !comp.concluded
    }
    switchCollection.onItemShifted=(undo, confirm, item, newIndex) =>{
      const newPosition = newIndex + 1
      //
      Manager.shiftResult(results, item.value, newPosition, (errors) =>{
        if (!errors){
          confirm()
          window.setTimeout(() =>{         
            reload()
          }, 500)
          
          //Manager.reload()
          return
        }
        undo()
      })
    }

    switchCollection.onItemsReordered = (items) =>{
      /*let replaysBelow = 0
      let newItems = Array.from(items, item =>{
        if (item.value.replay){

        }
      })*/
      let offset = 0
      items.forEach((item, index) =>{
        const element = item.getElement()
        const textElement = element.querySelector(".rp-position-text")
        //
        if (item.value.replay){
          offset++
        } else{
          textElement.innerHTML = getPositionText({position: index+1, offset: -offset})
        }
      })

    }

    results.forEach(result =>{
      const component = (<ResultPanel key={result.resultId} result={result} getPositionText={getPositionText} isDisabled={switchCollection.isDisabled}/>)
      const switchItem = new SwitchItem(result, component, `rp_${result.resultId}`)
      switchCollection.addItem(switchItem)
    })

    const getAddResult = () =>{
      if (!Manager.hasPermission() || comp.concluded)
        return (<></>)
      return (<AddResult competitionId={competitionId}/>)
    }
  return (
    <div id={`rbc_${competitionId}`} className='results-board-container'>
        <SwitchBoard switchCollection={switchCollection} className="result-switch-board"/>
        {getAddResult()}
    </div>
  )
}

export default ResultsBoard