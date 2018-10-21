import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import projectReducer from './reducers/project'

//Middleware
import callAPI from './middleware/callAPI'
import thunk from 'redux-thunk'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(
    combineReducers({
      projects: projectReducer
    }),
    composeEnhancers(applyMiddleware(thunk), applyMiddleware(callAPI))
  );

  return store;
};
