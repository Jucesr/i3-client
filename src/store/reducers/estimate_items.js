const initialState = {
  items: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  if(type.includes('REQUEST') && type.includes('ESTIMATE_ITEM')){
    return {
      ...state,
      isFetching: true
    }
  }

  if(type.includes('FAILURE') && type.includes('ESTIMATE_ITEM')){
    return {
      ...state,
      error,
      isFetching: false
    }
  }

  switch (type) {

    case 'ADD_ESTIMATE_ITEM_SUCCESS': {
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

    case 'DELETE_ESTIMATE_ITEM_SUCCESS': {

      let new_items = {
        ...state.items
      }
      delete new_items[response]

      return {
        ...state,
        items: new_items,
        error: null,
        isFetching: false
      };
    }

    case 'SELECT_ESTIMATE_ITEM': {
      return {
        ...state,
        active: payload
        
      }
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

    case 'LOAD_ESTIMATE_ITEMS_SUCCESS': {
      const estimate_items = response.reduce((current, ei) => {
        current[ei.id] = ei
        return current
      }, {})

      return {
        ...state,
        items: {
          ...state.items,
          ...estimate_items
        },
        error: null,
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
