import React, {useState, useEffect, useRef} from 'react'
import Utility from './Utility'
import { v4 as uuidv4 } from 'uuid';

const TogglePasswordInput = ({className, inputClass, togglerClass, placeholder, input}) => {
    const [eyeToggle, setEyeToggle] = useState(false);
    const [inputSelectionPosition, setInputSelectionPosition] = useState(0)
    const hasMountedOnce = useRef(false)

    const eye = { // details based on eye toggle
        true: {eyeClass: "fa-solid fa-eye", inputType: "text"},
        false: {eyeClass: "fa-sharp fa-solid fa-eye-slash", inputType: "password"}
    }

    useEffect(() =>{
        if (hasMountedOnce.current === true){
            const pInput = document.getElementById(input.inputId)
            pInput.focus()
            pInput.setSelectionRange(pInput.value.length, pInput.value.length)
        } else{
            hasMountedOnce.current = true
        }
    }, [eyeToggle])

    const handleTogglerClick = () =>{ //toggle eye state when eye container clicked
        
        setEyeToggle(!eyeToggle)
        const pInput = document.getElementById(input.inputId)
        setInputSelectionPosition(pInput.value.length)
    }

    const keyDown = e =>{
        if (e.key == "Enter")
            input.onEnter()
    }
  return (
    <div id={`tpc_${input.inputId}`} className={Utility.joinClass("toggle-password-container", className)}>
        <input type={eye[eyeToggle].inputType} placeholder={placeholder} name={input.inputId} id={input.inputId} className={Utility.joinClass("toggle-password-input", inputClass)} onKeyDown={keyDown} onChange={input.onChange} value={input.value}/>
        <div className={Utility.joinClass("toggle-password-toggler simple-center", togglerClass)} onClick={handleTogglerClick}>
            <i className={Utility.joinClass(eye[eyeToggle].eyeClass, "simple-center toggle-password-eye")} style={{maxWidth: 0}}></i>
        </div>
    </div>
  )
}

TogglePasswordInput.defaultProps = {
    inputId: `TogglePasswordInput_${uuidv4()}`,
    onEnter: () => {}
}


export default TogglePasswordInput