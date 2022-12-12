class CrudError{
    msg;
    code;
    constructor(msg, code){
        this.msg = msg;
        this.code = code;
    }
}

export class CrudErrorList{
    id;
    errors = []
    visible = false;
    validation;
    constructor(_id){
        this.id = _id
    }

    addError(error){
        const findError = this.errors.find(err =>{
            return error.code === err.code
        })
        if (findError){
            findError.msg = error.msg
            return
        }
        this.errors.push(error)
    }

    addErrors(errors){
        errors.forEach(err =>{
            this.addError(err)
        })
    }

    appendError(msg, code){
        this.addError(new CrudError(msg, code))
    }

    callErrors(){
        if (!this.visible)
            return []
        if (typeof(this.validation) !== "function")
            return this.errors;
        //this.clearErrors()
        this.validation(this)
        //this.addErrors(this.validation(this))
        return this.errors;
    }

    clearErrors(){
        this.errors = []
    }

    hasErrors(){
        return this.callErrors().length > 0
    }

    setVisible(_visible, clearList=true)
    {
        this.visible = _visible
        if (!_visible && clearList)
            this.clearErrors()
    }
}

export class CrudErrorCollection{
    #errorLists = {} // {inputId: CrudErrorList}
    constructor(){

    }

    addErrorList(errorList){
        this.#errorLists[errorList.id] = errorList
    }

    newList(_id){
        if (!this.#errorLists[_id])
            this.#errorLists[_id] = new CrudErrorList(_id)
    }

    getList(_id){
        return this.#errorLists[_id]
    }

    addServerCollection(collection){
        const ids = Object.keys(collection)
        ids.forEach(id =>{
            if (this.#errorLists[id])
                this.#errorLists[id].addErrors(collection[id])
        })
    }

    getErrors(id){
        if (this.#errorLists[id]){
            return this.#errorLists[id].callErrors()
        }
    }

    setVisible(id, _visible)
    {
        if (this.#errorLists[id]){
            this.#errorLists[id].visible = _visible
            if (!_visible)
                this.#errorLists[id].clearErrors()
        }
    }

    clearList(id){
        if (this.#errorLists[id]){
            this.#errorLists[id].clearErrors()
        }
    }

    hasErrors(){
        const keys = Object.keys(this.#errorLists)
        for (let i = 0; i < keys.length; i++){
            //
            this.#errorLists[keys[i]].clearErrors()
            if (this.#errorLists[keys[i]].callErrors().length > 0)
                return true
        }
    }

    fromInputs(inputs){
        inputs.forEach(input =>{
            if (input.errorList)
                this.addErrorList(input.errorList)
        })
    }

    setAllVisible(){
        const keys = Object.keys(this.#errorLists)
        keys.forEach(key =>{
            this.#errorLists[key].visible = true
        })
    }

    clearAll(){
        const keys = Object.keys(this.#errorLists)
        keys.forEach(key =>{
            this.#errorLists[key].clearErrors()
        })
    }
}

export default CrudError