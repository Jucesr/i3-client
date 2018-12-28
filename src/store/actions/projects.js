import pick from 'lodash/pick'

export const addProject = (project) => ({
  type    : 'ADD_PROJECT',
  payload : project
})

export const selectProject = (id) => ({
  type    : 'SELECT_PROJECT',
  payload : id
})

export const loadProjects = () => ({
  type    : 'LOAD_PROJECTS',
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/project/`)
        .then(
          response => {
            if(response.status != 200)
              reject(response)
          return response.json() 
          }
        )
        .then(response => {

          response = response.map(
            p => {
              return{
                ...pick(p, [
                  'id',
                  'name',
                  'code',
                  'description',
                  'status',
                  'type',
                  'currency',
                  'uen',
                  'picture_url',
                  'progress'
                ])
              }
              
            }
          )
          resolve(response) 
          })
    })
  }
})

