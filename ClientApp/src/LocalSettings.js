class SettingStructure{
    table;
    settingName;
    id;
    value;
    constructor(_table, _settingName, _id, _value){
        this.table = _table
        this.settingName = _settingName
        this.id = _id
        this.value = _value
    }
}

const LocalSettings = (function(){
    let settings = null
    const saveSettings = () =>{
        localStorage.setItem("ResultsNetLocal", JSON.stringify(settings))
    }

    try{
        settings = JSON.parse(localStorage.getItem("ResultsNetLocal"))
        if (!Array.isArray(settings))
            settings = []
        saveSettings()
    } catch (e){
        settings = []
        saveSettings()
    }
    

    const getValue = (table, settingName, id) =>{
        if (!Array.isArray(settings)) return null
        const setting = settings.find(s =>{
            return s.table === table && s.settingName === settingName && s.id === id
        })
        return setting ? setting.value : null
    }

    const setValue = (table, settingName, id, value) =>{
        const setting = settings.find(s =>{
            return s.table === table && s.settingName === settingName && s.id === id
        })
        if (setting){
            setting.value = value
        } else{
            settings.push(new SettingStructure(table, settingName, id, value))
        }
        saveSettings()
    }

    const clear = () =>{
        settings = {}
        saveSettings()
    }

    const getAll = () =>{
        return settings
    }
    
    return {getValue, setValue, getAll, clear}
})()

export default LocalSettings

/*

{
    user: {settingName: {{id: value}]},
    career: {settingName: [{id: value}]},
    season: {settingName: [{id: value}]}
}

*/

/*
    [
        {table, settingName, id, value}
    ]
*/