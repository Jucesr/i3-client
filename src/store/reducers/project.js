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

    case 'SELECT_PROJECT': {
      return {
        ...state,
        active: payload
        
      }
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

    case 'LOAD_ESTIMATES_SUCCESS': {
      //  This actions it's dispatched from Estimate reducer but it has to be handle here to add those the estimates
      //  loaded in to the project Only add the ids of the estimates.
      return {
        ...state,
        items: {
          ...state.items,
          [payload]: {
            ...state.items[payload],
            estimates: response.map(r => r.id)
          }
        }
      }
    }

    case 'ADD_ESTIMATE': {
      const active_project = state.items[state.active]
      return {
        ...state,
        items: {
          ...state.items,
          [active_project.id]: {
            ...active_project,
            estimates: active_project.estimates.concat(payload.id)
          }
        }
      }
    }

    default: {
      return state;
    }
  }
};
