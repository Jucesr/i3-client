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

export const setModuleName = (name) => ({
  type    : 'SET_MODULE_NAME',
  payload: name
})

export const clearModuleName = (name) => ({
  type    : 'CLEAR_MODULE_NAME',
  payload: name
})

export const toggleSideBar = () => ({
  type: 'TOGGLE_SIDEBAR'
})