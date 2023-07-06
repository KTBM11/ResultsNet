import React, {useState, useEffect} from 'react'
import SimpleHeader from './Base/SimpleHeader'
import SimpleText from './Base/SimpleText'
import TogglePasswordInput from './Base/TogglePasswordInput'
import Manager from '../Manager'
import ValidationList from './ValidationList'
import RouteComponent from './RouteComponent'

const RegisterPage = () => {
    const valObj = () => {return {username: {success: true, reasons: []}, password: {success: true, reasons: []}, confirmPassword: {success: true, reasons: []}, register: {success: true, reasons: []}}}
    const [vMessages, setVMessages] = useState(valObj())
    const [tokenStatusChecked, setTokenStatusChecked] = useState(false);

    useEffect(() =>{
        Manager.tokenStatus(true, (validToken) =>{
            setTokenStatusChecked(true);
        })
    }, [])

    const registerClick = () =>{
        const usernameInput = document.getElementById("register-username")
        const passwordInput = document.getElementById("register-password")
        const confirmPasswordInput = document.getElementById("confirm-password")
        const validationObj = valObj()
        const nameValidation = Manager.validUsername(usernameInput.value)
        const passwordValidation = Manager.validPassword(passwordInput.value)
        if (!nameValidation.success || !passwordValidation.success){
            validationObj.username = nameValidation
            validationObj.password = passwordValidation
        }
        if (passwordValidation.success && passwordInput.value != confirmPasswordInput.value){
            validationObj.confirmPassword.success = false
            validationObj.confirmPassword.reasons.push("Password does not match")
        }
        //
        if (!Manager.clientValidationSuccess(validationObj)){
            setVMessages(validationObj) 
            return
        }
        Manager.registerUser({Username: usernameInput.value, Password: passwordInput.value}, (success, errors) =>{
            
            errors.forEach(error =>{
                if (/^username(?=_)/.test(error.code)){
                    validationObj.username.reasons.push(error)
                } else if (/^password(?=_)/.test(error.code)){
                    validationObj.password.reasons.push(error)
                } else if (/^register(?=_)/.test(error.code)){
                    validationObj.register.reasons.push(error)
                }
            })
            setVMessages(validationObj) 
        })
    }
    const usernameInputMessage = vMessages.username.success ? "" : vMessages.username.reasons[0]
    const passwordInputMessage = vMessages.password.success ? "" : vMessages.password.reasons[0]
    const confirmPasswordInputMessage = vMessages.confirmPassword.success ? "" : vMessages.confirmPassword.reasons[0]

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
            <SimpleHeader text="Register" fontSize="25px" fontWeight="600" padding="0" fontStyle="italic"/>
            <div id='login-input-container'>
                <ValidationList validationMessages={vMessages.register.reasons} className="simple-center"/>
                <div className='login-input-group'>
                    <label htmlFor="register-username">Username</label>
                    <input name="register-username" id="register-username" className='login-input'/>
                    <ValidationList validationMessages={vMessages.username.reasons}/>
                </div>
                <div className='login-input-group'>
                    <label htmlFor="register-password">Password</label>
                    <TogglePasswordInput inputClass="login-input" className="login-password-container" inputId="register-password" inputName="register-password"/>
                    <ValidationList validationMessages={vMessages.password.reasons}/>
                </div>
                <div className='login-input-group'>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <TogglePasswordInput inputClass="login-input" className="login-password-container" inputId="confirm-password" inputName="confirm-password" onEnter={registerClick}/>
                    <ValidationList validationMessages={vMessages.confirmPassword.reasons}/>
                </div>
            </div>
            <div className='login-button simple-center' onClick={registerClick}>
                <SimpleText text="Submit" color="#fff" fontSize="18px"/>
            </div>
            <div className='register-text-container simple-center'>
                <a href="/login">Already have an account? Login</a>
            </div>
        </div>
    </div>
    </RouteComponent>
  )
}

export default RegisterPage