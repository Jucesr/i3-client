import React from 'react'
import ReactDom from 'react-dom'
import {Provider} from 'react-redux';
import configureStore from './store/';
import AppRouter from './routes/'
import LoadingPage from './components/LoadingPage'

import configureSocketIO from './services/socket'

import 'normalize.css/normalize.css'
import './styles/styles.scss'

const store = configureStore()

configureSocketIO(store)

const app = (
  <Provider store={store}>
    <AppRouter/>
  </Provider>
);

ReactDom.render(<LoadingPage/>, document.getElementById('app'));

ReactDom.render(app, document.getElementById('app'));
