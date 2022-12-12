export default class LocalCache{
    data;
    constructor(){
        try{
            this.data = JSON.parse(localStorage.getItem("ResultsNetLocalCache"))
        } catch (err){
            const initLocal = {}
            initLocal.competitions = {}
            localStorage.setItem("ResultsNewLocalCache", initLocal)
        }
    }
    
    getCompetition(compId){
        return this.data.competitions
    }

    updateCompetition(compId, compData){
        if ()
    }
}