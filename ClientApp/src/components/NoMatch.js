import React from 'react'
import RouteComponent from './RouteComponent'
import SimpleText from './Base/SimpleText'

const NoMatch = (props) => {
    
    
  return (
    <RouteComponent>
      <div id="no-match">
          <SimpleText text="Error 404 not found" fontSize="25px"/>
      </div>
    </RouteComponent>
  )
}

export default NoMatch