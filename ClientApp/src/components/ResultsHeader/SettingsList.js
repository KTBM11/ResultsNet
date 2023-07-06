import React, { useState } from 'react'
import SimpleText from '../Base/SimpleText';
import useReload from '../Base/useReload'
import {v4 as uuid} from 'uuid'
import SimpleCheckbox from '../Base/SimpleCheckbox';
import Manager from '../../Manager';

class ResultSetting{
    title;
    value;
    onChange = () => {};
    reload;
    id = uuid();
    type;
    constructor(_reload, _type="ResultSetting"){
        this.reload = _reload
        this.type = _type
    }

    getType(){
        return this.type
    }

    postRender(){

    }
}

class CheckboxSetting extends ResultSetting{
    beforeChange = (change) => change()

    constructor(_reload){
        super(_reload, "CheckboxSetting")
        this.onChange = (e) =>{
            this.beforeChange(() =>{
                this.value = !this.value
                
                this.reload()
            })        
        }
    }
}

function buildSettings(reload){
    const publicAccount = new CheckboxSetting(reload)
    publicAccount.title = "Public Account"
    publicAccount.value = Manager.isPublic()
    publicAccount.beforeChange = change =>{
        Manager.updateSettings({publicAccount: !publicAccount.value}, (errors) =>{
            if (!errors){
                change()
                return
            }
        })
    }
    return [publicAccount]
}

export const SettingsList = () => {
    const reload = useReload()
    const [settings, setSettings] = useState(buildSettings(reload))
    const [publicAccount] = settings

    const getSettingDiv = (setting) =>{
        switch(setting.getType()){
            case "CheckboxSetting":
                return (<div className='sl-checkbox sl-padding'>
                    <SimpleText text={setting.title}/>
                    <div className='sl-check-container'>
                        <SimpleCheckbox checked={setting.value} onClick={setting.onChange} className="sl-check-input"/>
                    </div>
                </div>)
            default:
                return "Shalom"
        }
    }

  return (
    <div>{settings.map((setting, i) =>{
        return (<div key={setting.id} className="sl-container">
            {getSettingDiv(setting)}
        </div>)
    })}</div>
  )
}
