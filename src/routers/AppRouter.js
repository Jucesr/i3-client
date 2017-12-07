import React from 'react';
import ReactDom from 'react-dom';
import {BrowserRouter , Route, Switch} from 'react-router-dom';
import Home from '../components/Home';
import NotFoundPage from '../components/NotFoundPage';

const AppRouter = () => (
  <BrowserRouter >
    <div>
      <Switch>
        <Route path="/" component={Home} exact={true} />
        <Route component={NotFoundPage} />
      </Switch>
    </div>

  </BrowserRouter>
)

export default AppRouter;
