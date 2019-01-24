import { convertToArrayObject, addChildrenToItems } from "utils";

const initialState = {
  projects: {},
  materials: {},
  line_items: {},
  isFetching: false
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'LOAD_PROJECTS_IMPORT_REQUEST':
    case 'LOAD_MATERIALS_IMPORT_REQUEST':
    case 'LOAD_LINE_ITEMS_IMPORT_REQUEST': {
      return {
        ...state,
        materials: {},
        line_items: {},
        isFetching: true
      }
    }

    case 'LOAD_PROJECTS_IMPORT_SUCCESS': {

      return {
        ...state,
        projects: convertToArrayObject(response),
        isFetching: false
      };
    }

    case 'LOAD_MATERIALS_IMPORT_SUCCESS': {

      return {
        ...state,
        materials: addChildrenToItems(convertToArrayObject(response)),
        isFetching: false
      };
    }

    case 'LOAD_LINE_ITEMS_IMPORT_SUCCESS': {

      return {
        ...state,
        line_items: addChildrenToItems(convertToArrayObject(response)),
        isFetching: false
      };
    }

    default:
      return state
  };
}
