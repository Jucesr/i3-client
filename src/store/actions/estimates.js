export const addEstimate = (estimate) => ({
  type    : 'ADD_ESTIMATE',
  payload : estimate
})

export const selectEstimate = (id) => ({
  type    : 'SELECT_ESTIMATE',
  payload : id
})

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
          estimate_items: [1, 2, 3]
        },{
          id: 2,
          code: "E02",
          name: "Revisión 2 - 23 Julio",
          description: "Primera presentación formal con el cliente en Mexicali",
          currency: "MXN",
          estimate_items: [4, 5, 6]
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
        }, 500);
        
      })
    }

  }
}