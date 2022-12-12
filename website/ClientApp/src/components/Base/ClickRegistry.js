const ClickRegistry = (function(){

    let registers = []

    const getRegisters = () =>{
        return registers
    }

    const containsRegistry = (groupId) =>{
        return registers.findIndex(reg =>{
            return reg.groupId == groupId
        }) != -1
    }

    const addRegistry = (groupId, button_id, content_id, eventType, callback) =>{
        //content.classList.add('hidden')
       // 
       // 
       //
       if (containsRegistry(groupId)) return;
        registers.push({groupId, button_id, content_id, eventType, callback})
    }

    const clearRegistry = () =>{
        registers = []
    }

    const removeByButtonId = (button_id) =>{
        registers.forEach((reg, index) =>{
            if (reg.button_id === button_id)
                registers.splice(index, 1)
        })
    }

    const removeGroup = (groupId) =>{
        registers.forEach((register, index) =>{
            if (register.groupId == groupId){
                registers.splice(index, 1)
            }
        })
    }

    const removeRegistry = (groupId, button_id, content_id) =>{
        const idIndex = registers.findIndex(register =>{
            return register.groupId == groupId &&  register.button_id == button_id && register.content_id == content_id
        })
        if (idIndex == -1) return
        registers.splice(idIndex, 1)
    }

    const scanRegisters = (e, eventType) =>{
        if (e.button != 0) return
        const cloneRegisters = [...registers]
        cloneRegisters.forEach((reg, index) =>{
            //
            //
            //
            //
            if (reg.eventType != eventType) return
            if (e.target.closest(`#${reg.content_id}`) != null){
                reg.callback(e.target, 'content_click')
            } else if (e.target.closest(`#${reg.button_id}`) != null){
                reg.callback(e.target, 'direct_click')
            } else {
                reg.callback(e.target, 'other_click')
            }

            /*if (e.target.id == reg.button_id){
                return reg.callback(e.target, 'direct_click')
            } else if (e.target.closest(`#${reg.content_id}`) != null){
                return reg.callback(e.target, 'content_click')
            }*/
            //return reg.callback(e.target, 'other_click')
        })
    }

    document.addEventListener('click', e =>{
        //
        scanRegisters(e, "click")
    })

    document.addEventListener("mousedown", e =>{
        //
        scanRegisters(e, "mousedown")
    })
    
    return {removeGroup, addRegistry, clearRegistry, removeRegistry, containsRegistry, removeByButtonId}
})()

export default ClickRegistry

/*
    const DropdownRegister = (function(){

        const registers = []
    
        const addRegistry = (button, content) =>{
            if (button.id == '')
                button.id = `DropdownRegisterButton_${newId()}`
            if (content.id == '')
                content.id = `DropdownRegisterContent_${newId()}`
            content.classList.add('DropdownRegister-hidden')
            registers.push({button, content})
        }
    
        document.addEventListener('click', e =>{
            registers.forEach(reg =>{
                if (e.target.id == reg.button.id){
                    reg.content.classList.toggle('DropdownRegister-hidden')
                    return
                } else if (e.target.closest(`#${reg.content.id}`) != null){
                    return
                }
                reg.content.classList.add('DropdownRegister-hidden')
            })
        })
        return {addRegistry}
    })()
    */