const initialState = {
  is_model_visible: false,
  is_estimate_detail_visible: true,
  is_sidebar_open: false,
  estimate_table_expanded: {},
  sub_header_tools: []
}

export default (state = initialState, action = {}) => {
  const {type, payload} = action;

  switch (type) {
    case "TOGGLE_MODEL":
      return{
        ...state,
        is_model_visible: !state.is_model_visible
      }

    case "TOGGLE_ESTIMATE_DETAILS":
      return{
        ...state,
        is_estimate_detail_visible: !state.is_estimate_detail_visible
      }

    case 'SAVE_EXPANDED' : {
      return {
        ...state,
        estimate_table_expanded: payload
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
  
    default:
      return state
    
  }
}