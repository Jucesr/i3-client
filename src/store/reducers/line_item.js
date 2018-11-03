const initialState = {
  items: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'ADD_LINE_ITEM': {
      return {
        ...state,
        items: {
          ...items,
          [action.payload.id]: {
            ...action.payload
          }
        }
      };
    }

    case 'SELECT_LINE_ITEM': {
      return {
        ...state,
        active: payload
        
      }
    }
    
    case 'LOAD_LINE_ITEMS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_LINE_ITEMS_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_LINE_ITEMS_SUCCESS': {

      const estimates = response.reduce((current, project) => {
        current[project.id] = project
        return current
      }, {})

      return {
        ...state,
        items: {
          ...state.items,
          ...estimates
        },
        error: null,
        isFetching: false
      };
    }

    case 'LOAD_LINE_ITEM_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_LINE_ITEM_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_LINE_ITEM_SUCCESS': {

      return {
        ...state,
        items: {
          ...state.items,
          [`${response.id}`]: {...response, lastFetched: Date.now()}
        },
        error: null,
        isFetching: false
      };
    }

    case 'CLEAR_LINE_ITEM': {
      return {
        ...state,
        active: undefined
        
      }  
    }
    case 'SELECT_PROJECT': {
      return {
        ...state,
        active: undefined
        
      }
    }

    default: {
      return state;
    }
  }
};
