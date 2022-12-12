import React, {useState, useEffect} from 'react'
import ResultsDropdown from './ResultsDropdown'
import Manager from '../../../Manager'
import AddCareerPopup from './Popups/AddCareerPopup'
import SimplePrompt from '../../Base/SimplePromp'
import AddSeasonPopup from './Popups/AddSeasonPopup'
import AddCompetitionButton from './AddCompetitionButton'
import Utility from '../../Base/Utility'
import { DropdownOption } from '../../../classes/DropdownOption'
import DropdownButton from '../../../classes/DropdownButton'
import DropdownProp from '../../../classes/DropdownProp'

const InitOptions = () =>{
    const career = {options: [], buttons: []}
    const season = {options: [], buttons: []}
    return {career, season}
}

const ResultsMenu = () => {
    //const [options, setCareerOptions] = useState({career: [], season: []})
    const [r, setR] = useState(false)
    const reload  = () =>{
        
        setR(!r)
    }
    //const options = {career: [], season: []}
    const careerDrop = new DropdownProp()
    careerDrop.header = "Filter by Career"
    const seasonDrop = new DropdownProp()
    seasonDrop.header = "Filter by Season"
    const careers = Manager.getCareers()
    const seasons = Manager.getSeasons()
    const shouldShowSeasonDropdown = Array.isArray(careers) && careers.length > 0 && Manager.getSelectedCareer() != null

    const addCareerClick = () =>{
        Manager.ShowPopup((<AddCareerPopup />));
    }
    
    const addSeasonClick = () =>{
        Manager.ShowPopup(<AddSeasonPopup />)
    }

    const careerRemoveYes = (id) =>{
        
        Manager.removeCareer(id, (success) =>{
            if (!success){
                
                return
            }
            Manager.ShowPopup(null)
        })
    }

    const seasonRemoveYes = (id) =>{
        Manager.removeSeason(id, (success, errors) =>{
            if (!success){
                
                return
            }
            Manager.ShowPopup(null)
        })
    }
    
    if (Array.isArray(careers)){
        careers.forEach(career =>{
            const careerOption = new DropdownOption()
            careerOption.dropdownName = "careers"
            careerOption.text = career.name
            careerOption.value = career.careerId
            if (Manager.hasPermission()){
                careerOption.addButton("Edit Season", "fa-solid fa-pen dropdown-pen", () =>{
                    
                    const editData = {}
                    editData.careerName = career.name
                    editData.careerId = career.careerId
                    Manager.ShowPopup(<AddCareerPopup editData={editData}/>)
                })
                careerOption.addButton("Remove Career", "fa-solid fa-thin fa-xmark icon-cross", () =>{
                    
                    Manager.ShowPopup(<SimplePrompt id="remove-career-prompt" yesClick={() => careerRemoveYes(career.careerId)} noClick={() => Manager.ShowPopup(null)} 
                        title={`Are you sure you want to remove this career? (${career.name})`}/>)
                })
            }
            //
            careerDrop.addOption(careerOption, career.careerId === Manager.getSelectedCareerId())
            //options.career.push({dropdownName: "careers", text: career.name, value: career.careerId, type: "editable"})
        })
        if (Manager.hasPermission()){
            const button = new DropdownButton()
            button.text = "Add Career"
            button.onClick = addCareerClick
            careerDrop.addButton(button)
        }
    }
    if (Array.isArray(seasons)){
        seasons.forEach(season =>{
            const seasonOption = new DropdownOption()
            seasonOption.dropdownName = "seasons"
            seasonOption.text = season.name
            seasonOption.value = season.seasonId
            if (Manager.hasPermission())
            {
                seasonOption.addButton("Edit Season", "fa-solid fa-pen dropdown-pen", () =>{
                    
                    const editData = {}
                    editData.seasonName = season.name
                    editData.seasonId = season.seasonId
                    editData.seasonTeamName = season.teamName
                    Manager.ShowPopup(<AddSeasonPopup editData={editData}/>)
                })

                seasonOption.addButton("Remove Season", "fa-solid fa-thin fa-xmark icon-cross", () =>{
                    Manager.ShowPopup(<SimplePrompt id="remove-season-prompt" title={`Are you sure you want to remove this season? (${season.name})`} 
                    yesClick={() => seasonRemoveYes(season.seasonId)} noClick={() => Manager.ShowPopup(null)}/>)
                })
            }
            seasonDrop.addOption(seasonOption, season.seasonId === Manager.getSelectedSeasonId())
        })
        if (Manager.hasPermission()){
            const button = new DropdownButton()
            button.text = "Add Season"
            button.onClick = addSeasonClick
            seasonDrop.addButton(button)
        }
    }

    //const defaultCareerIndex = options.career.findIndex(op => op.value === Manager.getSelectedCareerId())
    careerDrop.defaultTitle = careers.length >= 1 ? "Select Career" : "No Careers"

    //const defaultSeasonIndex = options.season.findIndex(op => op.value === Manager.getSelectedSeasonId())
    seasonDrop.defaultTitle = seasons.length >= 1 ? "Select Season" : "No Seasons"

    const careerClassName = careers.length < 1 && !Manager.hasPermission() ? "no-pointer-events" : ""
    const seasonClassName = seasons.length < 1 && !Manager.hasPermission()  ? "no-pointer-events" : "" 

    const onOptionSelect = (option) =>{
        if (option.dropdownName === "careers"){
            Manager.goToCareer(null, option.value, null)
            return true
        }
        else if (option.dropdownName === "seasons"){
            Manager.goToCareer(null, Manager.getSelectedCareerId(), option.value)
            return true
        }
        return false
    }

    careerDrop.onOptionSelect = onOptionSelect
    seasonDrop.onOptionSelect = onOptionSelect

    const competitionButton = () =>{
        if (Manager.getSelectedSeason() && Manager.hasPermission())
            return (<AddCompetitionButton />)
        return (<></>)
    }
  return (
    <div id="results-menu">
        <div id="rm-left" className='results-menu-section'>
            <ResultsDropdown className={Utility.joinClass("menu-dropdown", careerClassName)} dropProp={careerDrop}/>
            <ResultsDropdown className={Utility.joinClass("menu-dropdown", seasonClassName)} dropProp={seasonDrop} bother={Manager.getSelectedCareerId() != null}/>
        </div>
        <div id="rm-center" className='results-menu-section'></div>
        <div id="rm-right" className='results-menu-section'>
            {competitionButton()}
        </div>
    </div>
  )
}

export default ResultsMenu