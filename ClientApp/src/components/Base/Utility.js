const Utility = (function(){
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

    const fromPx = (num) =>{
        return Number(String(num).replace('px', ''))
    }

    const currency = num =>{
        num = Number(num)
        const str = `${num < 0 ? '-$' : '$'}${Math.abs((num)).toFixed(2)}`
        return str
    }

    const forwardDate = (date) =>{
        const zeroInFront = num =>{
            num = num.toString()
            return num.length == 1 ? `0${num}` : num
        }
        return `${zeroInFront(date.getDate())}-${zeroInFront(date.getMonth()+1)}-${date.getFullYear()}`
    }

    const isDate = (strDate) =>{
        return strDate.search(/^(\d{4})-(\d{2})-(\d{2})$/) != -1
    }
    //For adding aditional class names to a component
    const joinClass = (ogClass, additionalClass) =>{
        return (additionalClass != null && additionalClass != "") ? ogClass + " " + additionalClass : ogClass
    }

    const formatText = (text) =>{
        return text.replace(/(^ +)|(\ +$)/g, '').replace(/(?<=[^ ]) +(?=[^ ])/g, ' ')
    }

    const createValidationObject = (fields) =>{
        const valObj = {}
        fields.forEach(field =>{
            valObj[field] = []
        })
        valObj.success = () =>{
            let errorFree = true
            Object.keys(valObj).forEach(key =>{
                if (Array.isArray(valObj[key]) && valObj[key].length > 0)
                    errorFree = false
            })
            return errorFree;
        }
        return valObj
    }

    Array.prototype.bulkDelete = function(deleteFunc){
        let i = 0;
        while (i < this.length){
            if (deleteFunc(this[i])){
                this.splice(i, 1)
                i--
            }
            i++
        }
    }

    return {createValidationObject, monthNames, fromPx, currency, forwardDate, isDate, joinClass, formatText}
})()

export default Utility