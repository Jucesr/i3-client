import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import projectReducer from './reducers/project'
import estimateReducer from './reducers/estimate'
import estimateItemsReducer from './reducers/estimate_items'
import lineItemsReducer from './reducers/line_item'


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
      estimate_items: estimateItemsReducer,
      line_items: lineItemsReducer
    }),
    persistedState,
    composeEnhancers(applyMiddleware(thunk), applyMiddleware(callAPI))
  );

  store.subscribe(() => {
    saveState(store.getState())
  })

  return store;
};
