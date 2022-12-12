import React from 'react'
import SimpleText from './Base/SimpleText'
import Utility from './Base/Utility'

const ValidationList = ({validationMessages, className}) => {
  return (
    <div className={Utility.joinClass('validation-list', className)}>
        {validationMessages.map((reason, i) =>{
            if (true){
              return (
                <SimpleText key={reason.code} className="validation-message" text={reason.msg} fontSize="12px" color="#ff0000"/>   
              )
            }
        })}
    </div>
  )
}

export default ValidationList