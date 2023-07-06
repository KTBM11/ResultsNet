import Utility from "./components/Base/Utility";
import Cache from "./Cache";
import { FormatData } from "./classes/CompetitionFormatData";
import {v4 as uuid} from 'uuid'
import LocalSettings from "./LocalSettings";
const sharedConfig = require("./SharedConfig.json")
const Manager = (function(){
    const url = window.location.origin //<--- Production*/
    //const url = 'https://localhost:7000'
    let access_token = null
    let mCache = null;
    let localUsername = null;
    let currentPage = "";
    const ShowPopup = () => {}
    const popup = {} // for accessing the popup manager
    
    const setCache = (cache) =>{
        mCache = cache
    }
    const reload = () => {}

    const setCurrentPage = (page) =>{
        currentPage = page
    }

    const getCurrentPage = () =>{
        return currentPage
    }

    const initCacheFromStorage = () =>
    {
        let cacheData = sessionStorage.getItem("ResultsCache")
        let cacheExpire = sessionStorage.getItem("ResultsCacheExpire")
        try{
            if (cacheData == null || cacheExpire == null)
                throw new Error("null session data");
            let currentDateTime = new Date()
            let expireDateTime = new Date(cacheExpire)
            if (currentDateTime - expireDateTime > 0)
                throw new Error("Cache expired")
            //
            cacheData = JSON.parse(cacheData)
            mCache = Cache(cacheData)
            sessionStorage.removeItem("ResultsCache")
            return true
        } catch (err){
            //
            mCache = new Cache()
        }
        return false
    }

    const hasPermission = () =>{
        if (!mCache) return false
        return mCache.getData().hasPermissionToEdit
    }

    const isLoggedIn = () =>{
        if (mCache){
            return mCache.getData().valid_token
        }
        return false
    }

    const getPageUsername = () =>{
        if (!mCache) return null
        return mCache.getData().username
    }

    const isPublic = () =>{
        if (mCache){
            return mCache.getData().publicAccount
        }
        return false
    }

    const connect = (method, routeName, data, params, handleRedirect, callback) =>{
        const xhr = new XMLHttpRequest()
        xhr.open(method, `${url}/api/${routeName}/${params}`)
        //console.log(`${url}/api/${routeName}/${params}`)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.setRequestHeader('testing', 'true')
        //xhr.setRequestHeader("Authorization", access_token)
        xhr.withCredentials = true
        if (typeof(data) === "object"){
            data.SelectedCareerId = getSelectedCareerId()
            data.SelectedSeasonId = getSelectedSeasonId()
        }
        xhr.onload = () =>{
            let responseData
            try{
                responseData = JSON.parse(xhr.response)
                if (responseData.access_token != null){
                    access_token = responseData.access_token
                    //
                }
                responseData.shouldRedirect = responseData.redirect.length > 0
                if ((handleRedirect) && responseData.redirect.length > 0){
                    //
                    window.location.href = responseData.redirect
                    return
                }
            } catch (err){
                responseData = {}
            }
            //
            if (!responseData.errorCollection){
                responseData.errorCollection = {errors: {global: [{msg: "Unknown error", code: "error_unknown"}]}}
            }
            localUsername = responseData.verfiedUsername

            callback(xhr.status, responseData)
        }
        if (Object.keys(data).length > 0){
            xhr.send(JSON.stringify(data))
        } else
            xhr.send();
    }

    const tokenStatus = (redirect, callback) =>{
        //
        connect("GET", "auth/tokenstatus", {}, false, false, (status, response) =>{
            //(`[TOKENSTATUS] ${JSON.stringify(response)}`)
            if (status === 200){
                if (redirect && response.valid_token){
                    window.location.href = "/"
                    return
                }
                sessionStorage.setItem("ResultsNetPageInfo", "PagePathLoaded")
                return callback(true)
            }

            return callback(response.errorCollection.errors)
        })
    }

    const registerUser = (user, callback) =>{
        connect("POST", "auth/register", user, "", true, (status, response) =>{
            //
            if (status === 201)
                return callback
            return callback(response.errorCollection.errors)
        })
    }

    const loginUser = (user, callback) =>{
        connect("POST", "auth/login", user, "", true, (status, response) =>{
            //
            //
            if (status == 201){
                LocalSettings.clear()
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const getUserData = (username, careerId, seasonId, callback) =>{
        let params = `${username}/`
        params += careerId ? `${careerId}/` : ""
        params += seasonId ? seasonId : ""
        //
        connect("GET", "results/user", {}, params, true, (status, response) =>{
            //
            const careerData = response.careerData
            copyCareerDataToCache(response)
            if (status == 200){        
                //
                
                if (response.careerData){
                    const careerData = response.careerData
                    if (careerData.selectedCareerId && hasPermission())
                        LocalSettings.setValue("user", "selectedCareer", "local_user", careerData.selectedCareerId)
                    if (careerData.selectedSeasonId && hasPermission())
                        LocalSettings.setValue("career", "selectedSeason", careerData.selectedCareerId, careerData.selectedSeasonId)
                }
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const createCareer = (name, callback) =>{
        connect("POST", "results/update/add-career", {name}, "", false, (status, response) =>{
            //
            if (status == 201){
                mCache.addSingle("careers", {careerId: response.insertId, name, created: response.insertTime})
                mCache.overwriteTable("seasons", [])
                mCache.overwriteTable("competitions", [])
                mCache.overwriteTable("results", [])
                mCache.overwriteField("selectedCareerId", response.insertId)
                const data = mCache.getData()
                const jsonCache = JSON.stringify(mCache.getData())
                
                if (response.shouldRedirect){
                    if (Manager.hasPermission())
                        LocalSettings.setValue("user", "selectedCareer", "local_user", response.insertId) 
                    updateSessionCache()
                    return window.location.href = response.redirect
                }
                return callback(true)
            }
            return callback(response.errorCollection.errors)
        })
    }

    const createSeason = (name, teamName, callback) =>{
        connect("POST", "results/update/add-season", {name, teamName}, "", false, (status, response) =>{
            
            if (status == 201){
                mCache.addSingle("seasons", {seasonId: response.insertId, name, teamName, created: response.insertTime})
                mCache.overwriteTable("competitions", [])
                mCache.overwriteTable("results", [])
                mCache.overwriteField("selectedSeasonId", response.insertId)
                const data = mCache.getData()
                if (response.shouldRedirect){
                    if (Manager.hasPermission())
                        LocalSettings.setValue("career", "selectedSeason", getSelectedCareerId(), response.insertId)
                    updateSessionCache()
                    return window.location.href = response.redirect
                }
                return
            }
            return callback(response.errorCollection.errors)
        })
    }

    const createCompetitionFormat = (name, formats, callback) =>{
        formats = Array.from(formats, fmat =>{
            return {position: fmat.pos, output: fmat.out}
        })
        
        connect("POST", `results/update/add-competition-format`, {name, formats}, "", false, (status, response) =>{
            
            if (status == 201){
                mCache.deleteBulk("competition_formats", "name", name)
                formats.forEach(format =>{
                    mCache.addSingle("competition_formats", {name, position: format.position, output: format.output})
                })
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const createCompetition = (name, formatName, startAt, callback) =>{
        const data = {name, formatName, startAt, seasonId: getSelectedSeasonId()}
        
        connect("POST", "results/update/add-competition", data, "", false, (status, response) =>{
            
            if (status == 201){
                mCache.addSingle("competitions", {competitionId: response.insertId, name, formatName, startAt, seasonId: data.seasonId, concluded: false, minimized: false, created: response.insertTime})
                
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const createResult = (competitionId, oppTeam, goalsFor, goalsAgaints, replay, home, callback) =>{
        const data = {competitionId, oppTeam, goalsFor: Number(goalsFor), goalsAgaints: Number(goalsAgaints), replay, home}
        connect("POST", "results/update/add-result", data, "", false, (status, response) =>{
            
            if (status == 201){
                const newPosition = getResults(competitionId).length + 1
                data.position = newPosition
                data.resultId = response.insertId
                data.created = response.insertTime
                mCache.addSingle("results", data)

                const teamNames = mCache.getData().teamNames
                if (!teamNames.includes(oppTeam)){
                    teamNames.push(oppTeam)
                    mCache.overwriteTable("teamNames", teamNames)
                }

                callback()
            }
            return callback(response.errorCollection.errors)
        })    
    }

    const editCompetitionFormat = (oldName, newName, formats, callback) =>{
        formats = Array.from(formats, fmat =>{
            return {position: fmat.pos, output: fmat.out}
        })
        
        connect("POST", `results/update/edit-competition-format`, {ogName: oldName, name: newName, formats}, "", false, (status, response) =>{
            
            if (status == 201){
                mCache.deleteBulk("competition_formats", "name", oldName)
                formats.forEach(format =>{
                    mCache.addSingle("competition_formats", {name: newName, position: format.position, output: format.output})
                })
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const editCareer = (name, id, callback) =>{
        connect("PUT", "results/update/edit-career", {name, careerId: id}, "", false, (status, response) =>{
            
            if (status == 200){
                const editedCareer = mCache.getSingle("careers", "careerId", id)
                editedCareer.name = name
                return callback()
            }
            /*let errors = response.errors
            if (!errors)
                errors = [{msg: "Cannot establish connection to server", code: "error_no_connection"}]*/
            return callback(response.errorCollection.errors)
        })
    }

    const editSeason = (name, teamName, seasonId, callback) =>{
        connect("PUT", "results/update/edit-season", {name, teamName, seasonId}, "", false, (status, response) =>{
            
            if (status == 200){
                const editedSeason = mCache.getSingle("seasons", "seasonId", seasonId)
                editedSeason.name = name
                editedSeason.teamName = teamName
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const minimizeCompetition = (competition, callback) =>{
        if (hasPermission()){
            editCompetition(competition.name, competition.formatName, competition.startAt, competition.competitionId, false, true, callback)
            return
        }
        const editedComp = mCache.getSingle("competitions", "competitionId", competition.competitionId)
        editedComp.minimized = !competition.minimized
        callback()
    }

    const editCompetition = (name, formatName, startAt, competitionId, changeConcluded, changeMinimized, callback) =>{
        const competition = getCompetition(competitionId)
        const data = {name, formatName, startAt, concluded: (changeConcluded ? !competition.concluded : competition.concluded), minimized: (changeMinimized ? !competition.minimized : competition.minimized), competitionId}
        connect("PUT", "results/update/edit-competition", data, "", false, (status, response) =>{
            
            if (status == 200){
                const editedComp = mCache.getSingle("competitions", "competitionId", competitionId)
                editedComp.name = name
                editedComp.formatName = formatName
                editedComp.startAt = startAt
                editedComp.concluded = (changeConcluded ? !competition.concluded : competition.concluded)
                editedComp.minimized = (changeMinimized ? !competition.minimized : competition.minimized)
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const removeCareer = (id, callback) =>{
        connect("DELETE", "results/update/remove-career", {id}, "" , false, (status, response) =>{
            
            if (status == 200){
                mCache.deleteSingle("careers", "careerId", id)
                if (response.shouldRedirect){
                    const removingSelected = id === getSelectedCareerId()
                    mCache.overwriteField("selectedCareerId", null)
                    mCache.overwriteField("selectedSeasonId", null)
                    mCache.overwriteField("seasons", [])
                    mCache.overwriteField("competitions", [])
                    mCache.overwriteField("results", [])
                    if (hasPermission() && removingSelected)
                        LocalSettings.setValue("user", "selectedCareer", "local_user", null) 
                    updateSessionCache()
                    window.location.href = response.redirect
                    
                }
                /*if (response.careerData){
                    copyCareerDataToCache(response)
                    sessionStorage.setItem("ResultsCache", JSON.stringify(mCache.getData()))
                    window.location.href = response.redirect
                }*/
                return callback(true)
            }
            return callback (false, response.errors)
        })
    }

    const removeSeason = (id, callback) =>{
        connect("DELETE", "results/update/remove-season", {id}, "", false, (status, response) =>{
            
            if (status == 200){
                mCache.deleteSingle("seasons", "seasonId", id)
                if (response.shouldRedirect){
                    const removingSelected = id === getSelectedSeasonId()
                    mCache.overwriteField("selectedSeasonId", null)
                    mCache.overwriteField("competitions", [])
                    mCache.overwriteField("competitions", [])
                    mCache.overwriteField("results", [])
                    if (hasPermission() && removingSelected)
                        LocalSettings.setValue("career", "selectedSeason", getSelectedCareerId(), null)
                    updateSessionCache()
                    window.location.href = response.redirect
                }
                return callback(true)
            }
            return callback(false, response.errors)
        })
    }

    const removeCompetitionFormat = (name, callback) =>{
        connect("DELETE", "results/update/remove-competition-format", name, "", false, (status, response) =>{
            
            if (status == 200){
                mCache.deleteSingle("competition_formats", "name", name)
                return callback(true)
            }
            return callback(false)
        })
    }

    const removeCompetition = (id, callback) =>{
        const data = {id}
        connect("DELETE", "results/update/remove-competition", data, "", false, (status, response) =>{
            
            if (status == 200){
                mCache.deleteSingle("competitions", "competitionId", id)
                return callback(true)
            }
            return callback(false)
        })
    }

    const removeResult = (result, callback) =>{
        const data = {id: result.resultId}
        connect("DELETE", "results/update/remove-result", data, "", false, (status, response) =>{
            
            if (status === 200){
                mCache.getData().results.forEach(r =>{
                    if (r.competitionId !== result.competitionId) return
                    if (result.position < r.position)
                        r.position--
                })
                mCache.deleteSingle("results", "resultId", result.resultId)
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const shiftResult = (results, result, newPosition, callback) =>{
        const data = {resultId: result.resultId, newPosition}
        connect("PUT", "results/update/shift-result", data, "", false, (status, response) =>{
            //
            const offset = (result.position - newPosition === 0) ? 0 : (result.position - newPosition) / Math.abs(result.position - newPosition)
            //
            if (status == 200){
                const oldPosition = result.position
                results.forEach(r =>{
                    //
                    //
                    if ((r.position <= newPosition && r.position >= oldPosition) || (r.position >= newPosition && r.position <= oldPosition)){
                        //
                        r.position += offset
                    }
                })
                //
                result.position = newPosition
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }

    const updateSettings = (userSettings, callback) =>{
        const data = {publicAccount: userSettings.publicAccount}
        
        connect("PUT", "results/update/change-settings", data, "", false, (status, response) =>{
            
            if (status === 200){
                mCache.overwriteField("publicAccount", data.publicAccount)
                return callback()
            }
            return callback(response.errorCollection.errors)
        })
    }


    const updateSessionCache = () =>{
        const expireDateTime = new Date()
        expireDateTime.setTime(expireDateTime.getTime() + 5000)
        sessionStorage.setItem("ResultsCacheExpire", expireDateTime.toISOString())
        sessionStorage.setItem("ResultsCache", JSON.stringify(mCache.getData()))
    }

    const copyCareerDataToCache = (response) =>{
        if (typeof(response) !== "object") return
        const careerData = response.careerData
        mCache.overwriteField("hasPermissionToEdit", response.hasPermissionToEdit)
        mCache.overwriteField("valid_token", response.valid_token)
        if (!careerData) return
        Object.keys(careerData).forEach(key =>{
            const val = careerData[key]
            mCache.overwriteTable(key, val)
        })

    }

    const dataSorter = (a, b, order="asc") =>{
        const d1 = new Date(a.created)
        const d2 = new Date(b.created)
        return order=="asc" ? d1.getTime() - d2.getTime() : d2.getTime() - d1.getTime() 
    }

    const getCareers = () =>{
        if (!mCache) return []
        return mCache.getData().careers.sort(dataSorter)
    }

    const getSeasons = () =>{
        if (!mCache) return []
        return mCache.getData().seasons.sort(dataSorter)
    }

    const getCompetitions = () =>{
        if (!mCache) return []
        return mCache.getData().competitions.sort(dataSorter)
    }

    const getCompetition = (compid) =>{
        return mCache.getSingle("competitions", "competitionId", compid)
    }

    const getResults = (compId, sortResults=true) =>{
        const allResults = mCache.getData().results
        if (allResults)
        {
            const subset = allResults.filter(result =>{
                return result.competitionId === compId
            })
            if (sortResults)
                subset.sort((a, b) =>{
                    return a.position - b.position
                })
            let replaysBelow = 0
            subset.forEach(r =>{
                r.offset = -replaysBelow
                if (r.replay){
                    replaysBelow++
                }
            })
            return subset
        }
        return []
    }

    const getCompetitionFormat = (compId) =>{
        const comp = mCache.getSingle("competitions", "competitionId", compId)
        if (!comp) return null
        return getFormatData(comp.formatName);
    }

    const getFormatData = (name) =>{
        const formatData = new FormatData(name)
        mCache.getData().competition_formats.forEach(cf =>{
            if (cf.name === name)
                formatData.addRow(cf.position, cf.output)
        })
        return formatData
    }

    const careerById = (id) =>{
        const data = mCache.getData()
        if (!data.careers)
            return null
        return data.careers.find(career => career.careerId === id)
    }

    const seasonById = (id) =>{
        const data = mCache.getData()
        if (!data.seasons)
            return null
        return data.seasons.find(season => season.seasonId === id)
    }

    const getSelectedCareer = () =>{
        if (!mCache) return null
        const data = mCache.getData()
        return careerById(data.selectedCareerId)
    }

    const getSelectedSeason = () =>{
        if (!mCache) return null
        const data = mCache.getData()
        return seasonById(data.selectedSeasonId)
    }

    const getSelectedCareerId = () =>{
        const selectedCareer =  getSelectedCareer()
        return selectedCareer ? selectedCareer.careerId : null
    }

    const getSelectedSeasonId = () =>{
        const selectedSeason = getSelectedSeason()
        return selectedSeason ? selectedSeason.seasonId : null
    }

    const getFormatNames = () =>{
        if (!mCache || !mCache.getData().competition_formats) return []
        const names = []
        const data = mCache.getData()
        data.competition_formats.forEach((format) =>{
            if (!names.includes(format.name))
                names.push(format.name)
        })
        names.sort((a, b) =>{
            return a.localeCompare(b)
        })
        return names
    }

    const getTeamNames = () =>{
        if (!mCache || !mCache.getData().teamNames) return []
        return mCache.getData().teamNames
    }

    const getCareerPath = (username, careerId, seasonId) =>{
        username = username || getPageUsername()
        const isUsersPage = (username == localUsername) || (!username && localUsername)
        let url = `/results/user/`
        
        if (username == null && localUsername == null){
            return "/login"
        } else if (username == null){
            username = localUsername
        }

        if (isUsersPage && careerId == null){
            careerId = getLocalSelectedCareerId()
        }

        if (isUsersPage && careerId != null && seasonId == null){
            seasonId = getLocalSelectedSeasonId(careerId)
        }
        url += `${username}/`
        url += careerId == null ? "" : `${careerId}/`
        url += careerId != null && seasonId != null ? `${seasonId}` : ""
        return url
    }

    const goToCareer = (username, careerId, seasonId) =>{
        window.location.href = getCareerPath(username, careerId, seasonId)
    }

    const getLocalSelectedCareerId = () =>{ // what is stored in localstorage
        const selectedCareer = LocalSettings.getValue("user", "selectedCareer", "local_user")
        return selectedCareer
    }

    const getLocalSelectedSeasonId = (careerId) =>{
        //const selectedCareer = getLocalSelectedCareer()
        const selectedSeason = LocalSettings.getValue("career", "selectedSeason", careerId)
        return selectedSeason
    }

    const formatUsername = (username) =>{ // remove spaces before and after username
        return username.replace("^\s*", "").replace("\s*$", "")
    }

    const genericLengthReason = (name, min, max) =>{
        return {msg: `${name} must be between ${min} and ${max} characters`, code: `${name.toLowerCase().replace(" ", "_")}_incorrect_length`}
    }

    const validUsername = (username) =>{ // make sure username alligns with config
        const validation = {}
        validation.success = true;
        validation.reasons = [] 
        const {username_maxlength, username_minlength, username_is_ascii, username_expression, username_format_message} = sharedConfig
        if (username.length < username_minlength || username.length > username_maxlength){
            validation.success = false
            validation.reasons.push(genericLengthReason("Username", username_minlength, username_maxlength))
        }
        if (username_expression != null && !(new RegExp(username_expression)).test(username)){
            validation.success = false
            validation.reasons.push({msg: username_format_message, code: "username_format_mismatch"})
        }
        return validation
    }

    const validPassword = (password) =>{
        const validation = {}
        validation.success = true
        validation.reasons = []
        const {password_maxlength, password_minlength, password_expression, password_format_message} = sharedConfig
        if (password.length < password_minlength || password.length > password_maxlength){
            validation.success = false
            validation.reasons.push(genericLengthReason("Password", password_minlength, password_maxlength))
        }
        if (password_expression != null && !(new RegExp(password_expression)).test(password)){
            validation.success = false
            validation.reasons.push({msg: password_format_message, code: "password_format_mismatch"})
        }
        return validation
    }

    const validCareerName = (name) =>{
        const validation = {}
        validation.success = true
        validation.reasons = []
        const {career_name_minlength, career_name_maxlength, career_name_expression, career_name_format_message} = sharedConfig
        if (name.length < career_name_minlength || name.length > career_name_maxlength){
            validation.success = false
            validation.reasons.push(genericLengthReason("Career name", career_name_minlength, career_name_maxlength))
        }
        if (career_name_expression != null && !(new RegExp(career_name_expression).test(name))){
            validation.success = false
            validation.reasons.push({msg: career_name_format_message, code: "career_name_format_mismatch"})
        }
        return validation
    }

    const validSeasonInputs = (seasonName, teamName) =>{
        const valObj = Utility.createValidationObject(["seasonName", "teamName"])
        const {season_name_minlength, season_name_maxlength, season_name_expression, season_name_format_message,
        season_teamname_minlength, season_teamname_maxlength, season_teamname_expression, season_teamname_formate_message} = sharedConfig
        if (seasonName.length < season_name_minlength || seasonName.length > season_name_maxlength){
            valObj.seasonName.push(genericLengthReason("Season name", season_name_minlength, season_name_maxlength))
        }
        if (teamName.length < season_teamname_minlength || season_name_maxlength > season_teamname_maxlength){
            valObj.teamName.push(genericLengthReason("Team name", season_teamname_minlength, season_teamname_maxlength))
        }
        if (season_name_expression != null && !(new RegExp(season_name_expression).test(seasonName))){
            valObj.seasonName.push({msg: season_name_format_message, code: "season_name_format_mismatch"})
        }
        if (season_teamname_expression != null && !(new RegExp(season_teamname_expression).test(teamName))){
            valObj.teamName.push({msg: season_teamname_formate_message, code: "season_teamname_format_mismatch"})
        }
        return valObj
    }

    const clientValidationSuccess = (validationObj) =>{
        let valid = true
        Object.keys(validationObj).forEach(key =>{
            
            if (!validationObj[key].success){
                valid = false
            }
        })
        return valid
    }

    return {tokenStatus, registerUser, loginUser, validUsername, validPassword, formatUsername, clientValidationSuccess, getUserData, setCache, getCareers,
    getSeasons, careerById, getSelectedCareer, getSelectedCareerId, seasonById, getSelectedSeason, getSelectedSeasonId, goToCareer, ShowPopup,
    hasPermission, createCareer, validCareerName, removeCareer, validSeasonInputs, createSeason, initCacheFromStorage, removeSeason, editCareer,
    editSeason, getFormatNames, createCompetitionFormat, popup, removeCompetitionFormat, getFormatData, editCompetitionFormat, createCompetition, getCompetitions,
    removeCompetition, reload, editCompetition, getResults, createResult, genericLengthReason, getCompetitionFormat, removeResult, shiftResult, getCompetition, getTeamNames,
    isLoggedIn, setCurrentPage, getCurrentPage, minimizeCompetition, updateSettings, isPublic, localUsername}
})()

export default Manager