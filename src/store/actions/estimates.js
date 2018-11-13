import { loadEstimateItem } from "./estimate_items";

export const addEstimate = (estimate) => ({
  type    : 'ADD_ESTIMATE',
  payload : estimate
})

export const loadEstimateItems = () => ({
  type: 'LOAD_ESTIMATE_ITEMS',
  payload: id,
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/project/${id}/estimates`)
        .then(
          response => {
            if(response.status != 200)
              reject(response)
          return response.json() 
          }
        )
        .then(estimates => {

          let estimate_ids = estimates.map(
            item => {
              let estimate = pick(item, [
                'id',
                'code',
                'name',
                'description',
                'currency'
              ])

              //  Fire action in estimate reducer.
              dispatch(loadEstimate(estimate))

              return estimate.id
              
            }
          )

          

          resolve(estimate_ids) 
          })
    })
  }
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


export const loadEstimate = estimate => ({
  type    : 'LOAD_ESTIMATE',
  payload : estimate
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
            32,
            25,
            33,
            34,
            35,
            36,
            26,
            219,
            220,
            221,
            222,
            27,
            224,
            225,
            226,
            227,
            28,
            228,
            229,
            230,
            231,
            232,
            29,
            233,
            234,
            235,
            236,
            30,
            237,
            238,
            239,
            240,
            241,
            31,
            242,
            243,
            244,
            246,
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