import { convertToArrayObject} from "utils";

const initialState = {
  entities: {},
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

      const estimates = convertToArrayObject(response)

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
      These actions are dispatched from Estimate_Item reducer but it has to be handle here to add those the estimate entities
      loaded in to the estimate Only add the ids of the estimate entities.
    */

    case 'LOAD_ESTIMATE_ITEMS_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_ESTIMATE_ITEMS_SUCCESS': {
      
      let data = response.reduce((acum, current) => {
        return {
          ...acum,
          [current.id]: current
        }
      }, {})

      // It adds the property child to entities based on parent id.
      Object.keys(data).forEach(key => {
          if(data[key].parent_id !== null){
            const parent_id = data[key].parent_id
            if(!data[parent_id].hasOwnProperty('_children')){
              data[parent_id]._children = []
            }

            data[parent_id]._children.push(key)
          }
      })

      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: {
            ...state.entities[payload],
            estimate_items: data
          }
        },
        isFetching: false
      }
    }

    case 'ADD_ESTIMATE_ITEM_SUCCESS': {

      let newEstimateItems = {
        ...state.entities[payload].estimate_items
      }

      //  Verify if it's a root item or a item that has a parent. 
      if(response.parent_id != null){
        //  Item with parent. It needs to add it to the object and also update _children in parent
        if(!newEstimateItems[response.parent_id].hasOwnProperty('_children')){
          newEstimateItems[response.parent_id]._children = [] 
        }
        newEstimateItems[response.parent_id]._children = [
          ...newEstimateItems[response.parent_id]._children,
          response.id
        ]
      }
      newEstimateItems[response.id] = {...response, _children: []}

      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: {
            ...state.entities[payload],
            estimate_items: newEstimateItems
            
          }
        }
      };
    }

    case 'DELETE_ESTIMATE_ITEM_SUCCESS': {

      let estimate_id = payload
      let estimate_item = state.entities[estimate_id].estimate_items[response]
      let newEstimateItems = {
        ...state.entities[estimate_id].estimate_items
      }

      //  It has a parent, it needs to remove it from the _children property of the parent.
      if(estimate_item.parent_id != null && newEstimateItems.hasOwnProperty(estimate_item.parent_id)){
        
        newEstimateItems[estimate_item.parent_id]._children = newEstimateItems[estimate_item.parent_id]._children.filter(child_id => child_id != estimate_item.id)
      }

      delete newEstimateItems[estimate_item.id]

      return {
        ...state,
        entities: {
          ...state.entities,
          [estimate_id]: {
            ...state.entities[estimate_id],
            estimate_items: newEstimateItems
          }
        }
      }
    }

    case 'UPDATE_ESTIMATE_ITEM_SUCCESS': {

      let estimate_id = payload
      let newEstimateItems = {
        ...state.entities[estimate_id].estimate_items,
        [response.id]: {
          ...state.entities[estimate_id].estimate_items[response.id],
          ...response
        }
      }
      return {
        ...state,
        entities: {
          ...state.entities,
          [estimate_id]: {
            ...state.entities[estimate_id],
            estimate_items: newEstimateItems
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
