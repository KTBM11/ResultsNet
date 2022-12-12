import React, { useState, useRef, useEffect } from 'react'
import SimpleHeader from './Base/SimpleHeader'
import SimpleText from './Base/SimpleText'
import TogglePasswordInput from './Base/TogglePasswordInput'
import Manager from '../Manager'
import ValidationList from './ValidationList'
import RouteComponent from './RouteComponent'
const sharedConfig = require("../SharedConfig.json") // shared configuration with backend

const LoginPage = () => {
    const valObj = () => {return {username: {success: true, reasons: []}, password: {success: true, reasons: []}, login: {success: true, reasons: []}}}
    const [vMessages, setVMessages] = useState(valObj())
    const [tokenStatusChecked, setTokenStatusChecked] = useState(false);
    

    useEffect(() =>{
        Manager.tokenStatus(true, (validToken) =>{
            setTokenStatusChecked(true);
            if (validToken){

            }
        })
    }, [])

    const previousNameValid = vMessages.username.length == 0;
    const previousPasswordValid = vMessages.password.length == 0
    const loginClick = () =>{ // when login button is clicked

        const usernameInput = document.getElementById("login-username")
        const passwordInput = document.getElementById("login-password")
        const nameValidation = Manager.validUsername(usernameInput.value)
        const passwordValidation = Manager.validPassword(passwordInput.value)
        const validationObj = valObj()
        if (!nameValidation.success){
            validationObj.username = nameValidation
        }
        if (!passwordValidation.success){
            validationObj.password = passwordValidation
        }
        if (Manager.clientValidationSuccess(validationObj)){
            Manager.loginUser({Username: usernameInput.value, Password: passwordInput.value}, (success, errors) =>{
                errors.forEach(error =>{
                    if (/^username(?=_)/.test(error.code)){
                        validationObj.username.reasons.push(error)
                    } else if (/^password(?=_)/.test(error.code)){
                        validationObj.password.reasons.push(error)
                    } else if (/^login(?=_)/.test(error.code)){
                        validationObj.login.reasons.push(error)
                    }
                })
                setVMessages(validationObj)
            })
            return
        }
        setVMessages(validationObj)
    }

    const usernameInputMessage = ""//previousNameValid ? "" : vMessages.username[0]
    const passwordInputMessage = ""//previousPasswordValid ? "" : vMessages.password[0]
    //
    if (!tokenStatusChecked){
        return (
            <>
            </>
        )
    }
  return (
    <RouteComponent>
    <div id="login-page" className='simple-center'>
        <div id="login-section">
            <SimpleHeader text="Welcome" fontSize="25px" fontWeight="600" padding="0" fontStyle="italic"/>
            <div id='login-input-container'>
                <ValidationList validationMessages={vMessages.login.reasons} className='simple-center'/>
                <div className='login-input-group'>
                    <label htmlFor="login-username">Username</label>
                    <input name="login-username" id="login-username" className='login-input'/>
                    <ValidationList validationMessages={vMessages.username.reasons}/>
                </div>
                <div className='login-input-group'>
                    <label htmlFor="login-password">Password</label>
                    <TogglePasswordInput inputClass="login-input" className="login-password-container" inputId="login-password" inputName="login-password" onEnter={loginClick}/>
                    <ValidationList validationMessages={vMessages.password.reasons}/>
                </div>
            </div>
            <div className='login-button simple-center' onClick={loginClick}>
                <SimpleText text="Login" color="#fff" fontSize="18px"/>
            </div>
            <div className='register-text-container simple-center'>
                <a href="/register">Don't have an account? Register</a>
            </div>
        </div>
    </div>
    </RouteComponent>
  )
}

export default LoginPage