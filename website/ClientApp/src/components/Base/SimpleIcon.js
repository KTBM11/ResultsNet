import React from 'react'
import Utility from './Utility'

const SimpleIcon = ({id, containerClassName, iconClassName, title, onClick, fontSize}) => {
  return (
    <div id={id} className={Utility.joinClass("simple-center simple-icon-container", containerClassName)} title={title} onClick={onClick}>
        <i className={Utility.joinClass("simple-icon", iconClassName)} style={{fontSize}}></i>
    </div>
  )
}

export default SimpleIcon