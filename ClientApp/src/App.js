import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import ResultsLayout from './components/ResultsLayout';
import LoginPage from './components/LoginPage';
import LoginPage2 from './components/LoginPage2';
import RegisterPage from "./components/RegisterPage";
import RegisterPage2 from './components/RegisterPage2';
import ResultsPage from './components/ResultsPage/ResultsPage';
import NoMatch from './components/NoMatch';
import PreResultsPage from './components/ResultsPage/PreResultsPage';

import './custom.css'
import "./components/Base/Base.css"
import Blank from './components/Blank';

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <ResultsLayout>
        <Switch>
          <Route exact path='/' component={PreResultsPage} />
          {/*<Route path='/counter' component={Counter} />
          <Route path='/fetch-data' component={FetchData} />*/}
          <Route path="/login-original" component={LoginPage} />
          <Route path="/login" component={LoginPage2} />
          <Route path="/register" component={RegisterPage2} />
          <Route exact path="/results" component={PreResultsPage} />
          <Route exact path="/results/user" component={PreResultsPage} />
          <Route path="/results/user/:username" component={PreResultsPage}/>
          <Route path="*" component={NoMatch} />
        </Switch>
      </ResultsLayout>
    );
  }
}
