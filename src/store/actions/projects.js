import pick from 'lodash/pick'
import { loadEstimate } from "./estimates";

export const addProject = (project) => ({
  type    : 'ADD_PROJECT',
  payload : project
})

export const selectProject = (id) => ({
  type    : 'SELECT_PROJECT',
  payload : id
})

export const loadProjectEstimates = (id) => ({
  type: 'LOAD_PROJECT_ESTIMATES',
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


// export const loadProjects = () => {
//   return {

//     type: 'LOAD_PROJECTS',

//     callAPI: () => {
//       return new Promise((resolve, reject) => {
//         const projectsFetchedFromDB = [{
//           id: 1,
//           name: "Calzada",
//           uen: "Mexicali",
//           picture: "calzada.jpg",
//           progress: 25,
//           estimates: [1, 2]
//         },{
//           id: 2,
//           name: "Punta Este",
//           uen: "Mexicali",
//           picture: "punta_este.jpg",
//           progress: 90,
//           estimates: [3]
//         },{
//           id: 3,
//           name: "Calafia",
//           uen: "Mexicali",
//           picture: "calafia.jpg",
//           progress: 59,
//           estimates: [4]
//         }]

//         setTimeout(() => {
//           resolve(projectsFetchedFromDB)
//         }, 10);
        
//       })
//     }

//   }
// }