import React, {useEffect, useState} from 'react'
import RouteComponent from '../RouteComponent'
import Manager from '../../Manager'
import Cache from '../../Cache'
import ResultsMenu from './ResultsMenu/ResultsMenu'
import PopupManager from '../Base/PopupManager'
import ResourceNotFound from '../ResourceNotFound/ResourceNotFound'
import RefinedPopupManager from '../Base/RefinedPopupManager'
import CompetitionSection from './CompetitionSection/CompetitionSection'

const ResultsPage = (props) => {
    //const [cache, setCache] = useState(Cache())
    const [loaded, setLoaded] = useState(false)
    const [errMsg, setErrMsg] = useState(null)
    const [popupElement, setPopupElement] = useState(null)
    const [r, setR] = useState(false)
    Manager.setCurrentPage("results")
    Manager.reload = () =>{
      setR(r => !r)
    }
    //const rNames = props.location.pathname.split("\/").filter(Boolean)
    const username = props.username//rNames[2]
    const careerId = props.careerId//rNames[3]
    const seasonId = props.seasonId//rNames[4]
    /*
    
    */
    //Manager.setCache(cache)
    useEffect(() =>{
      //Manager.setCache(Cache())
      if (Manager.initCacheFromStorage()){
        setLoaded(true)
        return
      }
      Manager.getUserData(username, careerId, seasonId, (err) =>{
        
        if (err && err.global){
          const errors = err.global
          if (errors[0].code === "id_invalid_format")
            errors[0].msg = "The career or season is invalid"
          setErrMsg(errors[0].msg)
          return
        }
          setLoaded(true)
      })
    }, [])

    Manager.ShowPopup = (newPopup) =>{
      setPopupElement(newPopup)
    }
    //
    if (!loaded){
      return (
        <ResourceNotFound message={errMsg}/>
      )
    }

  return (
    <>
    <PopupManager elementPopup={popupElement}/>
    <RefinedPopupManager externalAccessor={Manager.popup}/>
    <RouteComponent >
      <div id="results-container">
        <div id="rc-left" className='results-container-section'></div>
        <div id="rc-center" className='results-container-section'>
          <ResultsMenu />
          <CompetitionSection />
        </div>
        <div id="rc-right" className='results-container-section'></div>
      </div>
    </RouteComponent>
    </>
  )
}

export default ResultsPage