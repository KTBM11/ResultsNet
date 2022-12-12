import React from 'react'
import Utility from '../../Base/Utility'

const ResultsPanelSection = ({children, className}) => {
  return (
    <div className={Utility.joinClass("results-panel-section", className)}>
        <div className="rp-inner-container">
            {children}
        </div>
    </div>
  )
}

export default ResultsPanelSection