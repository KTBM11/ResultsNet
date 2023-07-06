import { useEffect, useState } from "react"
import React from 'react'
import Manager from "../Manager";
import ResourceNotFound from "./ResourceNotFound/ResourceNotFound";


const Blank = () => {
    const [tokenStatusChecked, setTokenStatusChecked] = useState(false);
    const [errMsg, setErrMsg] = useState("")
    useEffect(() =>{
        
        Manager.tokenStatus(true, (validToken, errors) =>{
            setTokenStatusChecked(true);
            if (errors.global[0]){
                setErrMsg(errors.global[0].msg)
            }
        })
    }, [])
    /*if (!tokenStatusChecked){
        return (
            <>

            </>
        )
    }*/
  return (
    <ResourceNotFound message={errMsg}/>
  )
}

export default Blank