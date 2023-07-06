import React, { useState, useRef } from 'react'
import { TippedContainer } from '../Base/TippedContainer'
import SimpleIcon from "./../Base/SimpleIcon"
import {v4 as uuid} from 'uuid'
import ClickRegistry from '../Base/ClickRegistry'
import SimpleHeader from '../Base/SimpleHeader'
import { SettingsList } from './SettingsList'

const GearButton = () => {
  const [contentVisible, setContentVisible] = useState(false)
  const [tcLeft, setTcLeft] = useState("0")
  const [tcSide, setTcSide] = useState("left")
  const [tcWidth, setTcWidth] = useState("250")
  const clickGroup = useRef(uuid())
  const contentId = useRef(`content_${uuid()}`)
  const iconId = useRef(`icon_${uuid()}`)
  const sRef = useRef()
  const hasMountedOnce = useRef(false)

  ClickRegistry.addRegistry(clickGroup, iconId.current, contentId.current, "click", (target, status) =>{
    if (status === "direct_click")
      setContentVisible(x => !x)
    else if (status === "other_click")
      setContentVisible(false)
  })

  const TippedContainerPostRender = (containerElement, tOffset) =>{
    hasMountedOnce.current = true
    //
    const cRect = containerElement.getBoundingClientRect()
    const sRect = sRef.current.getBoundingClientRect()
    const sCenter = (sRect.left + (sRect.width / 2))
    const rightGap = (window.innerWidth - sCenter)
    //
    if (rightGap > tcWidth){
      setTcLeft(((sRect.width / 2) - tOffset) + "px")
    } else {
      setTcSide("right")
      setTcLeft((-tcWidth + tOffset + (sRect.width / 2)) + "px")
    }
  }

  return (
    <div ref={sRef} id="settings-container" className="simple-center">
        <SimpleIcon id={iconId.current} containerClassName="gear-icon-container" iconClassName="fa-solid fa-gear settings-icon" title="Settings"/>
        <TippedContainer contentId={contentId.current} className={(contentVisible) ? null : "no-display"} top="30px" triangleSide={tcSide} width={tcWidth + "px"} left={tcLeft} postRender={TippedContainerPostRender}>
          <div className='settings-content'>
            <SimpleHeader text="Settings" fontSize="20px"/>
            <SettingsList />
          </div>
        </TippedContainer>
    </div>
  )
}

export default GearButton