const initialState = {
  is_model_visible: false,
  is_estimate_detail_visible: true,
  is_sidebar_open: false
}

export default (state = initialState, action = {}) => {
  const {type} = action;

  switch (type) {
    case "TOGGLE_MODEL":
      return{
        ...state,
        is_model_visible: !state.is_model_visible
      }
    break;

    case "TOGGLE_ESTIMATE_DETAILS":
      return{
        ...state,
        is_estimate_detail_visible: !state.is_estimate_detail_visible
      }
    break;
  
    default:
      return state
    
  }
}