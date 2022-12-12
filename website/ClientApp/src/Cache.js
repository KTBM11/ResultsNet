import Utility from "./components/Base/Utility"
const Cache = function(oldCache={}){
    let data = {}

    const overwrite = (cacheable) =>{
        data = cacheable
    }

    overwrite(oldCache)

    const recordEqauls = (row, idfields, idvalues) =>{
        if (typeof(idfields) == 'string')
            idfields = [idfields]
        if (!Array.isArray(idvalues))
            idvalues = [idvalues]
            
        const num = idfields.reduce((prev, field, index) =>{
            if (row[field] === idvalues[index])
                return prev + 1
            return prev
        }, 0)
        return num == idfields.length
    }

    const addSingle = (table, record) =>{
        //console.log(table, record)
        if (data[table] == null || !Array.isArray(data[table])) return null
        data[table].push(record)
    }

    const deleteSingle = (table, idfields, idvalues) =>{
        if (data[table] == null || !Array.isArray(data[table])) return null
        let recordFound = false
        data[table].forEach((row, index) =>{
            if (!recordFound && recordEqauls(row, idfields, idvalues)) {
                recordFound = true;
                data[table].splice(index, 1)
            }
        })
    }

    const deleteBulk = (table, idfields, idvalues) =>{
        if (data[table] == null || !Array.isArray(data[table])) return null
        data[table].bulkDelete((record) =>{
            return recordEqauls(record, idfields, idvalues)
        })
    }


    const updateSingle = (table, idfields, idvalues, record) =>{
        let found = false
        if (data[table] == null || !Array.isArray(data[table])) return null
        data[table].forEach((row, index) =>{
            if (recordEqauls(row, idfields, idvalues)){
                data[table][index] = record
                found = true
            }
        })
        if (!found)
            data[table].push(record)
    }

    const getSingle = (table, idfields, idvalues) =>{
        //console.log(data[table])
        if (data[table] == null || !Array.isArray(data[table])) return null
        for (let i = 0; i < data[table].length; i++){
            const row = data[table][i]
            if (recordEqauls(row, idfields, idvalues)){
                return row
            }
        }
        return null
    }

    const overwriteTable = (table, obj) =>{
        data[table] = obj
    }

    const overwriteField = (fieldName, obj) =>{
        data[fieldName] = obj
    }

    const getData = () =>{
        return {...data}
    }

    return {overwrite, getData, updateSingle, addSingle, deleteSingle, deleteBulk, getSingle, overwriteTable, overwriteField}
}

export default Cache