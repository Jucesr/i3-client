const initialState = {
  entities: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {
    
    case 'LOAD_MATERIAL_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_MATERIAL_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_MATERIAL_SUCCESS': {

      return {
        ...state,
        entities: {
          ...state.entities,
          [response.id]: {
            ...response
          }
        },
        error: null,
        isFetching: false
      };
    }

    default: {
      return state;
    }
  }
};
