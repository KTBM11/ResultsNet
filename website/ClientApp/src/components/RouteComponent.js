import React from 'react'
import ResultsHeader from './ResultsHeader/ResultsHeader'
import Manager from '../Manager'
import { Main } from './Main'

const RouteComponent = ({children, loggedIn}) => {
  return (
    <>
    <ResultsHeader loggedIn={loggedIn}/>
    <Main>
        {children}
    </Main>
    </>
  )
}

export default RouteComponent