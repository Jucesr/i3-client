import { mergeDeep } from "utils";

const initialState = {
  module_name: undefined,
  is_sidebar_open: false,
  is_model_visible: false,
  is_estimate_detail_visible: true,
  is_import_window_visible: false,
  estimate_table_expanded: {},
  sub_header_tools: []
}

export default (state = initialState, action = {}) => {
  const {type, payload} = action;

  switch (type) {
    case "TOGGLE_IMPORT_WINDOW":
      return{
        ...state,
        is_import_window_visible: !state.is_import_window_visible
      }

    case "TOGGLE_MODEL":
      return{
        ...state,
        is_model_visible: !state.is_model_visible
      }

    case "TOGGLE_SIDEBAR":
      return{
        ...state,
        is_sidebar_open: !state.is_sidebar_open
      }

    case "TOGGLE_ESTIMATE_DETAILS":
      return{
        ...state,
        is_estimate_detail_visible: !state.is_estimate_detail_visible
      }

    case 'SAVE_EXPANDED' : {
      return {
        ...state,
        estimate_table_expanded: mergeDeep(state.estimate_table_expanded, payload)
      }
    }

    case 'ADD_SUBHEADER_TOOLS': {
      return {
        ...state,
        sub_header_tools: payload
      }
    }

    case 'CLEAR_SUBHEADER_TOOLS': {
      return {
        ...state,
        sub_header_tools: []
      }
    }

    case 'SET_MODULE_NAME': {
      return {
        ...state,
        module_name: payload
      }
    }

    case 'SET_MODULE_NAME': {
      return {
        ...state,
        module_name: payload
      }
    }

    case 'CLEAR_MODULE_NAME': {
      return {
        ...state,
        module_name: undefined
      }
    }
  
    default:
      return state
    
  }
}