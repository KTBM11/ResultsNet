import React from 'react'
import Manager from '../../Manager'
import SimpleIcon from '../Base/SimpleIcon'

const HomeButton = () => {
    const homeClick = () =>{
        window.location.href = "/"
    }
    const getButton = () =>{
        if (Manager.isLoggedIn()){
            return (<SimpleIcon id="header-home" iconClassName="fa-solid fa-house" title="Home" onClick={homeClick} fontSize="35px"/>)
        }
        return (<></>)
    }
  return (
    <div>{getButton()}</div>
  )
}

export default HomeButton