const initialState = {
  items: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'ADD_ESTIMATE_ITEM': {
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

    case 'SELECT_ESTIMATE_ITEM': {
      return {
        ...state,
        active: payload
        
      }
    }
    
    case 'LOAD_ESTIMATE_ITEMS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_ESTIMATE_ITEMS_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_ESTIMATE_ITEMS_SUCCESS': {

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

    case 'LOAD_ESTIMATE_ITEM_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_ESTIMATE_ITEM_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_ESTIMATE_ITEM_SUCCESS': {

      return {
        ...state,
        items: {
          ...state.items,
          [response.id]: response
        },
        error: null,
        isFetching: false
      };
    }

    case 'UPDATE_ESTIMATE_ITEM_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'UPDATE_ESTIMATE_ITEM_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'UPDATE_ESTIMATE_ITEM_SUCCESS': {

      return {
        ...state,
        items: {
          ...state.items,
          [response.id]: response
        },
        error: null,
        isFetching: false
      };
    }

    case 'CLEAR_ESTIMATE_ITEM': {
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
