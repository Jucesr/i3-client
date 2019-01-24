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

    case 'COPY_MATERIAL_SUCCESS':
    case 'ADD_MATERIAL_SUCCESS': {
      return {
        ...state,
        entities: {
          ...state.entities,
          [response.id]: response
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
        entities: {
          ...state.entities,
          ...items
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
