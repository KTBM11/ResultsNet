import React, {useState} from 'react'

const SimpleSlider = ({isChecked, checkedTitle, notCheckedTitle, onClick}) => {
    const [checked, setChecked] = useState(isChecked)

    const sliderClick = () =>{
        onClick(() =>{
            setChecked(prevChecked => !checked)
        })       
    }
  return (
    <div className="simple-slider-container" title={checked ? checkedTitle : notCheckedTitle}>
        <label className="ss-switch">
            <input type="checkbox" className={checked ? "checked" : undefined} onClick={sliderClick}/>
            <span className="ss-slider"></span>
        </label>
    </div>
  )
}

SimpleSlider.defaultProps = {
    isChecked: false,
    title: "",
    onClick: (foo) => foo(),
    checkedTitle: "",
    notCheckedTitle: ""
}

export default SimpleSlider