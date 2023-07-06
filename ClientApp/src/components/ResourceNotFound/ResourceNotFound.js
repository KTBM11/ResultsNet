import React from 'react'
import Manager from '../../Manager'
import SimpleText from '../Base/SimpleText'
import RouteComponent from '../RouteComponent'

const ResourceNotFound = ({message}) => {
    const loggedIn = Manager.isLoggedIn()
  return (
    <RouteComponent loggedIn={loggedIn}>
        <div id="resource-not-found">
            <SimpleText text={message}/>
        </div>
    </RouteComponent>
  )
}

ResourceNotFound.defaultProps ={
  loggedIn: false,
}

export default ResourceNotFound