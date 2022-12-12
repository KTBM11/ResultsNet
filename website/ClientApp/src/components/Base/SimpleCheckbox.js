import React, {useEffect, useRef} from 'react'
import {v4 as uuidv4} from 'uuid'

const SimpleCheckbox = ({checked, onClick, id, className}) => {
  const ref = useRef()
  useEffect(() =>{
    ref.current.checked = checked
  })
  return (
    <div className='simple-checkbox-container simple-center'>
        <input ref={ref} type='checkbox' id={id} className={`simple-checkbox ${className}`} onClick={onClick}/>
    </div>
  )
}

SimpleCheckbox.defaultProps = {
  id: `__${uuidv4()}`
}

export default SimpleCheckbox