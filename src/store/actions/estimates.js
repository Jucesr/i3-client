import pick from 'lodash/pick'

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

export const loadEstimates = (project_id) => ({
  type: 'LOAD_ESTIMATES',
  payload: project_id,
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/project/${project_id}/estimates`)
        .then(
          response => {
            if(response.status != 200)
              reject(response)
          return response.json() 
          }
        )
        .then(estimates => {

          estimates = estimates.map(
            item => {
              let estimate = pick(item, [
                'id',
                'code',
                'name',
                'description',
                'currency'
              ])

              return estimate
              
            }
          )

          resolve(estimates) 
          })
    })
  }
})