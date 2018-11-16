const initialState = {
  items: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

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

    case 'SELECT_ESTIMATE': {
      return {
        ...state,
        active: payload
        
      }
    }

    case 'CLEAR_ESTIMATE': {
      return {
        ...state,
        active: undefined
        
      }  
    }

    /*
      These actions are dispatched from Estimate_Item reducer but it has to be handle here to add those the estimate items
      loaded in to the estimate Only add the ids of the estimate items.
    */
    case 'LOAD_ESTIMATE_ITEMS_SUCCESS': {
      
      return {
        ...state,
        items: {
          ...state.items,
          [payload]: {
            ...state.items[payload],
            estimate_items: response.map(r => r.id)
          }
        }
      }
    }

    case 'ADD_ESTIMATE_ITEM_SUCCESS': {

      return {
        ...state,
        items: {
          ...state.items,
          [payload]: {
            ...state.items[payload],
            estimate_items: state.items[payload].estimate_items.concat(response.id)
            
          }
        }
      };
    }

    case 'DELETE_ESTIMATE_ITEM_SUCCESS': {

      let estimate_id = payload
      let estimate_item_id = response

      return {
        ...state,
        items: {
          ...state.items,
          [estimate_id]: {
            ...state.items[estimate_id],
            estimate_items: state.items[estimate_id].estimate_items.filter(item => item != estimate_item_id)
          }
        }
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
