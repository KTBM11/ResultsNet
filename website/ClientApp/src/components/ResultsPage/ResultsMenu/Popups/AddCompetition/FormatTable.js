import React, {useState, useEffect} from 'react'
import SimpleIcon from '../../../../Base/SimpleIcon'
import SimpleText from '../../../../Base/SimpleText'
import CrudTextInput from '../../../CrudForm/CrudTextInput'
import {v4 as uuid} from 'uuid'

const FormatTable = ({initialTableData, editData}) => {
    // tableData {pos, out}
    const [tableData, setTableData] = useState(initialTableData)
    

    const newTableData = () => {return {pos: '', out: ''}}

    const update = () => {
        setTableData([...tableData])
    }

    const plusClick = () =>{
        tableData.push(newTableData())
        update()
    }

    const removeClick = (index) =>{
        tableData.splice(index, 1)
        update()
    }

    const getRowSymbol = (index) =>{
        const lastRow = index == tableData.length - 1
        if (!lastRow && tableData.length > 1)
            return (<SimpleIcon iconClassName="fa-solid fa-thin fa-xmark" title="Remove" onClick={() => {removeClick(index)}}/>)
        return (<SimpleIcon containerClassName="ft-symbol-plus" iconClassName="fa-regular fa-plus fa-solid" title="Add Row" onClick={plusClick}/>)
    }
    if (tableData.length == 0){
        tableData.push(newTableData())
        update()
    }
  return (
    <div id="format-table">
        <div className='format-table-row'>
            <div className='ft-collumn-header ft-container ft-pos-container'>
                <SimpleText text="Position" fontSize="16px"/>
            </div>
            <div className='ft-collumn-header ft-container ft-out-container'>
                <SimpleText text="Output" fontSize="16px"/>
            </div>
        </div>
        {tableData.map((data, i) =>{
            return (
            <div key={uuid()} className='format-table-row'>
                <div className='ft-container ft-pos-container'>
                    <CrudTextInput value={data.pos}/>
                </div>
                <div className='ft-container ft-out-container'>
                    <CrudTextInput value={data.out}/>
                </div>
                <div className='ft-container ft-symbol simple-center'>
                    {/*<SimpleIcon iconClassName="fa-solid fa-thin fa-xmark" title="Remove"/>*/
                    getRowSymbol(i)}
                </div>
            </div>)
        })}
    </div>
  )
}
FormatTable.defaultProps = {
    initialTableData: [/*{pos: "1-6", out: "[P]"}, {pos: "7-8", out: "Round of 16"}*/],
}

export default FormatTable