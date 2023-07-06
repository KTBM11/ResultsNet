import React from 'react'
import SimpleText from './SimpleText'

const SimplePrompt = ({title, yesText, yesClick, noText, noClick, id}) => {
  return (
    <div className='simple-prompt-container' id={id}>
        <div className='simple-prompt-text-section simple-center'>
            <SimpleText text={title} color="rgb(119, 119, 119)" fontSize="16px"/>
        </div>
        <div className='simple-prompt-buttons'>
            <div className='simple-prompt-button simple-prompt-yes simple-center' onClick={yesClick}>
                <SimpleText text={yesText} fontStyle="15px" color="white"/>
            </div>
            <div className='simple-prompt-button simple-prompt-no simple-center' onClick={noClick}>
                <SimpleText text={noText} fontStyle="15px" color="white"/>
            </div>
        </div>
    </div>
  )
}
SimplePrompt.defaultProps = {
    title: "Prompt?",
    yesText: "Yes",
    yesClick: () => {},
    noText: "No",
    noClick: () => {},
}
export default SimplePrompt