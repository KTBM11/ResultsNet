import {useState} from 'react'

export default function useReload(callback = () =>{}){
    const [r, setR] = useState(false)
    return () =>{
        callback()
        setR(prevR => !prevR)
    }
}