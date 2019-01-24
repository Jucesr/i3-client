import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import projectReducer from './reducers/project'
import estimateReducer from './reducers/estimate'
import lineItemsReducer from './reducers/line_item'
import materialReducer from './reducers/material'
import importWindowReducer from './reducers/import_window'
import UIReducer from "./reducers/ui";


//Middleware
import callAPI from './middleware/callAPI'
import {loadState, saveState} from './middleware/localStorage'
import thunk from 'redux-thunk'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const persistedState = loadState()

export default () => {
  const store = createStore(
    combineReducers({
      projects: projectReducer,
      estimates: estimateReducer,
      line_items: lineItemsReducer,
      materials: materialReducer,
      ui: UIReducer,
      import_window: importWindowReducer
    }),
    persistedState,
    composeEnhancers(applyMiddleware(thunk), applyMiddleware(callAPI))
  );

  store.subscribe(() => {
    saveState(store.getState())
  })

  return store;
};
