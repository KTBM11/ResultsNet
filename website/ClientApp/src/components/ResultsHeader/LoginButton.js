import React from 'react'
import SimpleText from '../Base/SimpleText'
import Manager from '../../Manager'

const LoginButton = () => {
    const logoutClick = e =>{
        window.location.href = "/login"
    }
  return (
    <div className='header-logout-button' onClick={(logoutClick)}>
        <SimpleText text="Login" fontSize="19px" color="#000"/>
    </div>
  )
}

export default LoginButton