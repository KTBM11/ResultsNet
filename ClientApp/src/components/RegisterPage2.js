import React, {useState, useEffect} from 'react'
import SimpleHeader from './Base/SimpleHeader'
import SimpleText from './Base/SimpleText'
import TogglePasswordInput from './Base/TogglePasswordInput'
import Manager from '../Manager'
import ValidationList from './ValidationList'
import RouteComponent from './RouteComponent'
import { CrudInput, CrudPasswordInput } from '../classes/CrudFormInput'
import { CrudErrorCollection } from '../classes/CrudError'
import CrudForm from './ResultsPage/CrudForm/CrudForm'
import useReload from './Base/useReload'
import FifaWallpaper from "../assets/fifawallpaper.jpg"
const sharedConfig = require("../SharedConfig.json") // shared configuration with backend

const InitInputs = () =>{
    const usernameInput = new CrudInput("register-username")
    usernameInput.title = "Username"
    usernameInput.value = ""
    usernameInput.setValidation(eList =>{
        const value = usernameInput.value
        const {username_maxlength, username_minlength, username_is_ascii, username_expression, username_format_message} = sharedConfig
        if (value.length < username_minlength || value.length > username_maxlength){
            eList.addError(Manager.genericLengthReason("Username", username_minlength, username_maxlength))
        }
        if (username_expression != null && !(new RegExp(username_expression)).test(value)){
            eList.appendError(username_format_message, "username_format_mismatch")
        }
    })
    const passwordInput = new CrudPasswordInput("register-password")
    passwordInput.title = "Password"
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

    const confirmPasswordInput = new CrudPasswordInput("register-confirm-password")
    confirmPasswordInput.title = "Confirm Password"
    confirmPasswordInput.enterSubmit = true
    confirmPasswordInput.setValidation(eList =>{
        if (confirmPasswordInput.value !== passwordInput.value){
            eList.appendError("Password does not match", "confirm_password_mismatch")
        }
    })

    return [usernameInput, passwordInput, confirmPasswordInput]
}

const RegisterPage2 = () => {
    const [tokenStatusChecked, setTokenStatusChecked] = useState(false);
    const [inputs, setInputs] = useState(InitInputs)
    const [errorCollection, setErrorCollection] = useState(new CrudErrorCollection())
    document.body.style.backgroundImage = `url(${FifaWallpaper})`
    const reload = useReload()

    useEffect(() =>{
        Manager.tokenStatus(true, (validToken) =>{
            setTokenStatusChecked(true);
        })
    }, [])

    const [usernameInput, passwordInput, confirmPasswordInput] = inputs
    errorCollection.fromInputs(inputs)
    errorCollection.newList("global")

    const inputOnChange = function(e){
        this.value = e.target.value
        errorCollection.setVisible(this.inputId, false)
        reload()
    }

    usernameInput.onChange = inputOnChange.bind(usernameInput)
    passwordInput.onChange = function(e){
        passwordInput.value = e.target.value
        errorCollection.setVisible(passwordInput.inputId, false)
        errorCollection.setVisible(confirmPasswordInput.inputId, false)
        reload()
    }
    confirmPasswordInput.onChange = inputOnChange.bind(confirmPasswordInput)

    const registerClick = (canSubmitAgain) =>{
        errorCollection.setAllVisible()
        if (!errorCollection.hasErrors()){
            Manager.registerUser({Username: usernameInput.value, Password: passwordInput.value}, (errors) =>{
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
                <CrudForm title="Register" inputs={inputs} submitText="Register" onSubmit={registerClick} globalErrors={errorCollection.getErrors("global")}/>
                <div className='register-text-container simple-center'>
                    <a href="/login">Already have an account? Login</a>
                </div>
            </div>
        </div>
    </RouteComponent>
  )
}

export default RegisterPage2