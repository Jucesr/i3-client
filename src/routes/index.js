import React from 'react';
import {BrowserRouter , Route, Switch} from 'react-router-dom';
import DrashboardRoute from './dashboard/';
import ProjectRoute from './projects/';
import socketIOClient from "socket.io-client";

import HomePage from '../components/Home';
import NotFoundPage from '../components/NotFoundPage';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default () => (
  <BrowserRouter >
    <div>
      <Header />
      <Switch>
        <Route path="/" component={HomePage} exact={true}/>
        <Route path="/dashboard" component={DrashboardRoute} />
        <Route path="/projects" component={ProjectRoute} />
        <Route component={NotFoundPage} />
      </Switch>

      {/* <Footer /> */}
    </div>

  </BrowserRouter>
)

