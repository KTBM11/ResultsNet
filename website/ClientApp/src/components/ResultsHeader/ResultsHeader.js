import React from 'react'
import SimpleText from '../Base/SimpleText'
import SettingsSections from './SettingsSections'
import Utility from '../Base/Utility'
import HomeButton from './HomeButton'

const ResultsHeader = ({loggedIn, className}) => {
  return (
    <div id="results-header" className={Utility.joinClass("results-header", className)}>
        <div id="r-header-left" className='r-header-section'>
          <div id="header-left-buttons">
            <HomeButton />
          </div>
        </div>
        <div id="r-header-center" className='r-header-section simple-center'>
            <SimpleText className="header-title" text="Results Net" width="max-content" color="#fff" fontSize="34px"/>
        </div>
        <div id="r-header-right" className='r-header-section'>
            <SettingsSections />
        </div>
    </div>
  )
}

ResultsHeader.defaultProps = {
  loggedIn: false,
}

export default ResultsHeader