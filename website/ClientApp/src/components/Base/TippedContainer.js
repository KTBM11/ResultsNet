import React, {useState, useEffect, useRef} from 'react'
import Utility from './Utility'
import {v4 as uuid} from "uuid"

export const TippedContainer = ({id, contentId, children, className, contentClassName, postRender, triangleSide, left, width, top, borderColor, triangleColor}) => {
    const containerRef = useRef()
    const triangleHeight = 15
    const triangleWidth = 20
    const borderString = `1px solid ${borderColor}`
    const triangleOffsetX = 5
    const triangleOffsetY = 1
    const triangleTranform = (triangleSide === "left") ? `translate(${triangleOffsetX}px, ${triangleOffsetY}px)` : `translate(${-triangleOffsetX}px, ${triangleOffsetY}px)`

    useEffect(() =>{
        const triangleCenterOffset = (triangleWidth / 2) + triangleOffsetX
       postRender(containerRef.current, triangleCenterOffset)
    })

    

  return (
    <div ref={containerRef} id={id} className={Utility.joinClass("tipped-container", className)} style={{width, top, left: left}}>
        <div className="triangle-panel" style={{borderBottom: borderString, justifyContent: (triangleSide==="left" ? "flex-start" : "flex-end")}}>

            <div className='triangle-container' style={{backgroundColor: borderColor, width: `${triangleWidth}px`, height: `${triangleHeight}px`, transform: triangleTranform}}>
                <div className="outer-triangle" style={{backgroundColor: triangleColor}}></div>
            </div>
        </div>
        <div id={contentId} className={Utility.joinClass("tipped-content", contentClassName)} style={{width: "100%", borderLeft: borderString, borderRight: borderString, borderBottom: borderString}}>
            {children}
        </div>
    </div>
  )
}

TippedContainer.defaultProps = {
    id: `TippedContainer_${uuid()}`,
    contentId: `TippedContent_${uuid()}`,
    postRender: () => {},
    triangleSide: "left",
    top: "0",
    left: "0",
    width: "100px",
    borderColor: "#000",
    triangleColor: "#fff",
    centerElementId: "____" + uuid()
}
