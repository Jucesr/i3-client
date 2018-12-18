const initialState = {
  entities: {},
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
        entities: {
          ...entities,
          [action.payload.id]: {
            ...action.payload
          }
        }
      };
    }
    
    case 'LOAD_LINE_ITEMS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    // case 'LOAD_LINE_ITEMS_FAILURE': {
    //   return {
    //     ...state,
    //     error,
    //     isFetching: false
    //   };
    // }

    case 'LOAD_LINE_ITEMS_SUCCESS': {

      const estimates = response.reduce((current, project) => {
        current[project.id] = project
        return current
      }, {})

      return {
        ...state,
        entities: {
          ...state.entities,
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

      let li = state.entities[response.id] ? state.entities[response.id] : {} 
      return {
        ...state,
        entities: {
          ...state.entities,
          [response.id]: {
            ...li,
            ...response, 
            lastFetched: Date.now()
          }
        },
        error: null,
        isFetching: false
      };
    }


    case 'LOAD_LINE_ITEM_DETAILS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_LINE_ITEM_DETAILS_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_LINE_ITEM_DETAILS_SUCCESS': {
      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: {
            ...state.entities[payload],
            line_item_details: [
              ...response
            ],
            lastFetched: Date.now()
          }
        },
        error: null,
        isFetching: false
      };
    }

    case 'UPDATE_LINE_ITEM_DETAIL_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'UPDATE_LINE_ITEM_DETAIL_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'UPDATE_LINE_ITEM_DETAIL_SUCCESS': {

      const new_details = state.entities[payload].line_item_details.map( lid => {
        if(lid.id == response.id){
          lid = {
            ...lid,
            ...response
          }
        }
        return lid
      })

      //Calculate unit_rate
      const unit_rate = new_details.reduce((acum, detail) => {  
        return {
          mxn: acum.mxn + (detail.unit_rate_mxn * detail.quantity),
          usd: acum.usd + (detail.unit_rate_usd * detail.quantity)
        }
      }, {mxn: 0, usd: 0})

      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: {
            ...state.entities[payload],
            line_item_details: new_details,
            unit_rate_mxn: unit_rate.mxn,
            unit_rate_usd: unit_rate.usd,
            lastFetched: Date.now()
          }
        },
        error: null,
        isFetching: false
      };
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
