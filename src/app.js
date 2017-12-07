import React from 'react'
import ReactDom from 'react-dom'
import AppRouter from './routers/AppRouter'
import LoadingPage from './components/LoadingPage'

import 'normalize.css/normalize.css'
import './styles/styles.scss'



ReactDom.render(<LoadingPage/>, document.getElementById('app'));

ReactDom.render(<AppRouter/>, document.getElementById('app'));
