import React, {useState} from 'react'
import Utility from '../Base/Utility'
import LogoutButton from './LogoutButton'
import Manager from '../../Manager'
import LoginButton from './LoginButton';
import GearButton from './GearButton';
import {v4 as uuid} from 'uuid'
class SettingsButton{
  component;
  shouldShow = () => true;
  whitelist = [];
  blacklist = [];
  id = uuid();
  constructor(_component){
    this.component = _component
  }

  addToWhitelist(){
    for (let i=0; i < arguments.length; i++){
      this.whitelist.push(arguments[i])
    }
  }

  addToBlacklist(){
    for (let i=0; i < arguments.length; i++){
      this.blacklist.push(arguments[i])
    }
  }

  isValidPage(){
    if (this.whitelist.length === 0 && !this.blacklist.includes(Manager.getCurrentPage())){
      return true
    } else if (this.whitelist.includes(Manager.getCurrentPage()))
      return true
    return false
  }

  canShow(){
    return this.isValidPage() && this.shouldShow()
  }
}

const makeSettingsButtons = () =>{
  const logout = new SettingsButton((<LogoutButton key="logout"/>))
  logout.addToWhitelist("results")
  logout.shouldShow = Manager.isLoggedIn

  const login = new SettingsButton((<LoginButton key="login"/>))
  login.addToWhitelist("results")
  login.shouldShow = () => !Manager.isLoggedIn()

  const settings = new SettingsButton(<GearButton />)
  settings.addToWhitelist("results")
  settings.shouldShow = Manager.hasPermission

  return [settings, logout, login]
}

const SettingsSections = ({className}) => {
  const [buttons] = useState(makeSettingsButtons())
  return (
    <div className={Utility.joinClass('settings-section', className)}>
        {buttons.map((button, i) =>{
          if (button.canShow())
            return (<div key={button.id}>{button.component}</div>)
        })}
    </div>
  )
}

export default SettingsSections