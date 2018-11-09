import { loadEstimateItemById } from "./estimate_items";

export const addEstimate = (estimate) => ({
  type    : 'ADD_ESTIMATE',
  payload : estimate
})

export const selectEstimate = (id) => {
  return (dispatch, getState) => {
    dispatch({
      type    : 'SELECT_ESTIMATE',
      payload : id
    })
    let state = getState().estimates
    let estimate_items = state.items[id].items

    estimate_items.forEach(element => {
      dispatch(loadEstimateItemById(element))
    });
  }
}

export const clearEstimate = () => ({
  type    : 'CLEAR_ESTIMATE',
  payload : {}
})

export const saveExpanded = (expanded) => ({
  type    : 'SAVE_EXPANDED',
  payload : expanded
})

export const loadEstimates = () => {
  return {
    type: 'LOAD_ESTIMATES',
    callAPI: () => {
      return new Promise((resolve, reject) => {

        
        const EstimatesFetchedFromDB = [{
          id: 1,
          code: "E01",
          name: "Revisión 1 - 10 Junio",
          description: "Idea de costo",
          currency: "MXN",
          items: [11, 12, 13, 14, 15, 16, 17]
        },{
          id: 2,
          code: "E02",
          name: "Revisión 2 - 23 Julio",
          description: "Primera presentación formal con el cliente en Mexicali",
          currency: "MXN",
          items: [
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
            32,
            33,
            34,
            35,
            36,
            219,
            220,
            221,
            222,
            224,
            225,
            226,
            227,
            228,
            229,
            230
          ]
        },{
          id: 3,
          code: "E01",
          name: "Alternativa 1",
          description: "",
          currency: "USD"
        },{
          id: 4,
          code: "E01",
          name: "Idea de costo",
          description: "",
          currency: "MXN"
        }]

        setTimeout(() => {
          resolve(EstimatesFetchedFromDB)
        }, 10);
        
      })
    }

  }
}