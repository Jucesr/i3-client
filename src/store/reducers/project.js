const initialState = {
  items: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'ADD_PROJECT': {
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
    
    case 'LOAD_PROJECTS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_PROJECTS_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_PROJECTS_SUCCESS': {

      const projects = response.reduce((current, project) => {
        current[project.id] = project
        return current
      }, {})

      return {
        ...state,
        items: {
          ...state.items,
          ...projects
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
