import React, { useState, useEffect, useRef } from 'react'
import ResourceNotFound from '../ResourceNotFound/ResourceNotFound'
import Manager from '../../Manager'
import ResultsPage from './ResultsPage'
import LocalSettings from '../../LocalSettings'

const PreResultsPage = (props) => {
    const rNames = props.location.pathname.split("\/").filter(Boolean)
    let username = rNames[2]
    const careerId = rNames[3]
    const seasonId = rNames[4]
    const ready = (sessionStorage.getItem("ResultsNetPageInfo") != null) || (seasonId != null)
    sessionStorage.removeItem("ResultsNetPageInfo")
    const [errMsg, setErrMsg] = useState("")
    

    useEffect(() =>{
        if (ready) {
            return
        }
        Manager.tokenStatus(false, (errors) =>{
            //
            if (errors && errors.global){
                setErrMsg(errors.global[0])
                return
            }
            Manager.goToCareer(username, careerId, seasonId)
        })
    }, [])
    if (ready){
        return (<ResultsPage username={username} careerId={careerId} seasonId={seasonId}/>)
    }

  return (
    <ResourceNotFound message={errMsg.msg}/>
  )
}

export default PreResultsPage