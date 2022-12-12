import React from 'react'
import ResultsHeader from "./ResultsHeader/ResultsHeader"
import { Main } from './Main'

const ResultsLayout = (props) => {
  return (
    <div id="results-layout">
        {/*<ResultsHeader />
        <Main>*/}
            {props.children}
        {/*</Main>*/}
    </div>
  )
}

export default ResultsLayout