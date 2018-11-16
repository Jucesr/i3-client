export const toggleModel = () => ({
  type: 'TOGGLE_MODEL'
})

export const toggleEstimateDetails = () => ({
  type: 'TOGGLE_ESTIMATE_DETAILS'
})

export const saveExpanded = (expanded) => ({
  type    : 'SAVE_EXPANDED',
  payload : expanded
})

export const addSubHeaderTools = (tools) => ({
  type    : 'ADD_SUBHEADER_TOOLS',
  payload : tools
})

export const clearSubHeaderTools = () => ({
  type    : 'CLEAR_SUBHEADER_TOOLS'
})