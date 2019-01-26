import { convertToArrayObject, addChildrenToItems } from "utils";

const initialState = {
  entities: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'IMPORT_MATERIAL_SUCCESS':
    case 'COPY_MATERIAL_SUCCESS':
    case 'ADD_MATERIAL_SUCCESS': {

      let newEntities = {
        ...state.entities
      }

      //  Verify if it's a root item or a item that has a parent. 
      if(response.parent_id != null){
        //  Item with parent. It needs to add it to the object and also update _children in parent
        if(!newEntities[response.parent_id].hasOwnProperty('_children')){
          newEntities[response.parent_id]._children = [] 
        }
        newEntities[response.parent_id]._children = [
          ...newEntities[response.parent_id]._children,
          response.id
        ]
      }
      newEntities[response.id] = {...response, _children: []}

      return {
        ...state,
        entities: {
          ...state.entities,
          ...newEntities
        }
      };
    }

    case 'DELETE_MATERIAL_SUCCESS': {

      let item = state.entities[response]
      let newItems = {
        ...state.entities
      }

      //  It has a parent, it needs to remove it from the _children property of the parent.
      if(item.parent_id != null && newItems.hasOwnProperty(item.parent_id)){
        newItems[item.parent_id]._children = newItems[item.parent_id]._children.filter(child_id => child_id != item.id)
      }

      delete newItems[item.id]

      return {
        ...state,
        isFetching: false,
        entities: {
          ...newItems
        }
      }
    }

    case 'UPDATE_MATERIAL_SUCCESS': {
      
      let org = state.entities[response.id]
      
      return {
        ...state,
        isFetching: false,
        entities: {
          ...state.entities,
          [response.id]: {
           ...org,
           ...response 
          }
        }
      }
    }

    case 'UNLOAD_MATERIALS': {
      return {
        ...state,
        entities: {}
      };
    }
    
    case 'LOAD_MATERIALS_REQUEST':
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

    case 'LOAD_MATERIALS_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_MATERIALS_SUCCESS': {

      //  It first transform the array into an object.
      let items = convertToArrayObject(response)

      //  It adds the property child to entities based on parent id.
      items = addChildrenToItems(items)

      return {
        ...state,
        entities: items,
        error: null,
        isFetching: false
      };
    }

    default: {
      return state;
    }
  }
};
