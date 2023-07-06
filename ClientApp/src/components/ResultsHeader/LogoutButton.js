import React from 'react'
import SimpleText from '../Base/SimpleText'
import Manager from '../../Manager'
import LocalSettings from '../../LocalSettings'

const LogoutButton = () => {
    const logoutClick = e =>{
        
        LocalSettings.clear()
        document.cookie = "results_net_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login"
    }
  return (
    <div className='header-logout-button' onClick={(logoutClick)}>
        <SimpleText text="Logout" fontSize="19px" color="#000"/>
    </div>
  )
}

export default LogoutButton