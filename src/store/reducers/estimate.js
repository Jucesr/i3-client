const initialState = {
  items: {},
  error: null,
  isFetching: false,
  active: undefined,
  expanded: {},
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'ADD_ESTIMATE': {
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

    case 'SELECT_ESTIMATE': {
      return {
        ...state,
        active: payload
        
      }
    }
    
    case 'LOAD_ESTIMATES_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_ESTIMATES_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_ESTIMATES_SUCCESS': {

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

    case 'CLEAR_ESTIMATE': {
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

    case 'SAVE_EXPANDED' : {
      return {
        ...state,
        expanded: payload
      }
    }

    default: {
      return state;
    }
  }
};
