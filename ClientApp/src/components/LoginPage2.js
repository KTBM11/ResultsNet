import React, { useState, useRef, useEffect } from 'react'
import SimpleHeader from './Base/SimpleHeader'
import SimpleText from './Base/SimpleText'
import TogglePasswordInput from './Base/TogglePasswordInput'
import Manager from '../Manager'
import ValidationList from './ValidationList'
import RouteComponent from './RouteComponent'
import CrudForm from './ResultsPage/CrudForm/CrudForm'
import { CrudInput, CrudPasswordInput } from '../classes/CrudFormInput'
import CrudError, { CrudErrorCollection } from '../classes/CrudError'
import useReload from './Base/useReload'
import FifaWallpaper from "../assets/fifawallpaper.jpg"

const sharedConfig = require("../SharedConfig.json") // shared configuration with backend

const InitInputs = () =>{
    const usernameInput = new CrudInput("login-username")
    usernameInput.title = "Username"
    usernameInput.value = ""
    usernameInput.setValidation((eList) =>{
        const value = usernameInput.value
        const {username_maxlength, username_minlength, username_is_ascii, username_expression, username_format_message} = sharedConfig
        if (value.length < username_minlength || value.length > username_maxlength){
            eList.addError(Manager.genericLengthReason("Username", username_minlength, username_maxlength))
        }
        if (username_expression != null && !(new RegExp(username_expression)).test(value)){
            eList.appendError(username_format_message, "username_format_mismatch")
        }
    })

    const passwordInput = new CrudPasswordInput("login-password")
    passwordInput.title = "Password"
    passwordInput.enterSubmit = true
    passwordInput.setValidation(eList =>{
        const password = passwordInput.value
        const {password_maxlength, password_minlength, password_expression, password_format_message} = sharedConfig
        if (password.length < password_minlength || password.length > password_maxlength){
            eList.addError(Manager.genericLengthReason("Password", password_minlength, password_maxlength))
        }
        if (password_expression != null && !(new RegExp(password_expression)).test(password)){
            eList.appendError(password_format_message, "password_format_mismatch")
        }
    })

    return [usernameInput, passwordInput]
}

const LoginPage2 = () => {
    const [tokenStatusChecked, setTokenStatusChecked] = useState(false);
    const [inputs, setInputs] = useState(InitInputs())
    const [errorCollection, setErrorCollection] = useState(new CrudErrorCollection())
    errorCollection.fromInputs(inputs)
    errorCollection.newList("global")
    const [usernameInput, passwordInput] = inputs
    const reload = useReload()
    document.body.style.backgroundImage = `url(${FifaWallpaper})`
    //document.body.style.background = "url('https://wallpaper.dog/large/17048551.jpg') no-repeat center center fixed"

    const inputOnChange = function(e){
        this.value = e.target.value
        errorCollection.setVisible(this.inputId, false)
        reload()
    }

    usernameInput.onChange = inputOnChange.bind(usernameInput)
    passwordInput.onChange = inputOnChange.bind(passwordInput)

    useEffect(() =>{
        Manager.tokenStatus(true, (validToken) =>{
            setTokenStatusChecked(true);
            if (validToken){

            }
        })
    }, [])

    const loginClick = (canSubmitAgain) =>{
        errorCollection.setAllVisible()
        if (!errorCollection.hasErrors()){
            Manager.loginUser({Username: usernameInput.value, Password: passwordInput.value}, (errors) =>{
                canSubmitAgain()
                if (!errors) return
                
                errorCollection.addServerCollection(errors)
                reload()
            })
            return
        }
        canSubmitAgain()
        reload()
    }

  return (
    <RouteComponent>
        <div id="login-page" className="simple-center">
            <div id="login-section">
                <CrudForm title="Login" inputs={inputs} submitText="Login" onSubmit={loginClick} globalErrors={errorCollection.getErrors("global")}/>
                <div className='register-text-container simple-center'>
                    <a href="/register">Don't have an account? Register</a>
                </div>
            </div>
        </div>
    </RouteComponent>
  )
}

export default LoginPage2