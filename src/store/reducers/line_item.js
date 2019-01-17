const initialState = {
  entities: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'UPDATE_LINE_ITEM_DETAIL_REQUEST':
    case 'LOAD_LINE_ITEM_DETAILS_REQUEST':
    case 'LOAD_LINE_ITEM_REQUEST':
    case 'LOAD_LINE_ITEMS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'UNLOAD_LINE_ITEMS': {
      return {
        ...state,
        entities: {}
      };
    }

    case 'ADD_LINE_ITEM_SUCCESS': {
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.response.id]: {
            ...action.response
          }
        }
      };
    }
    
    

    case 'LOAD_LINE_ITEMS_SUCCESS': {

      //  It first transform the array into an object.
      let obj = response.reduce((acum, current) => {
        return {
          ...acum,
          [current.id]: current
        }
      }, {})

      //  It adds the property child to entities based on parent id.
      Object.keys(obj).forEach(key => {
        if(obj[key].parent_id != null){
          const parent_id = obj[key].parent_id
          //  The material belongs to a category material. It needs to add it as it's child
          if(!obj[parent_id].hasOwnProperty('_children')){
            obj[parent_id]._children = []
          }
          obj[parent_id]._children.push(key) 
        }
    })

      return {
        ...state,
        entities: {
          ...state.entities,
          ...obj
        },
        error: null,
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

    case 'LOAD_LINE_ITEM_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
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

    case 'UPDATE_LINE_ITEM_DETAIL_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'UPDATE_LINE_ITEM_DETAIL_SUCCESS': {

      // const new_details = state.entities[payload].line_item_details.map( lid => {
      //   if(lid.id == response.id){
      //     lid = {
      //       ...lid,
      //       ...response
      //     }
      //   }
      //   return lid
      // })

      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: {
            ...state.entities[payload],
            line_item_details: response,
            unit_rate_mxn: unit_rate.mxn,
            unit_rate_usd: unit_rate.usd,
            lastFetched: Date.now()
          }
        },
        error: null,
        isFetching: false
      };
    }

    case 'ADD_LINE_ITEM_DETAIL_SUCCESS': {
      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: {
            ...state.entities[payload],
            line_item_details: [
              ...state.entities[payload].line_item_details,
              response
            ],
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
