export const addProject = (project) => ({
  type    : 'ADD_PROJECT',
  payload : project
})

export const selectProject = (id) => ({
  type    : 'SELECT_PROJECT',
  payload : id
})


export const loadProjects = () => {
  return {

    type: 'LOAD_PROJECTS',

    callAPI: () => {
      return new Promise((resolve, reject) => {
        const projectsFetchedFromDB = [{
          id: 1,
          name: "Calzada",
          uen: "Mexicali",
          picture: "calzada.jpg",
          progress: 25,
          estimates: [1, 2]
        },{
          id: 2,
          name: "Punta Este",
          uen: "Mexicali",
          picture: "punta_este.jpg",
          progress: 90,
          estimates: [3]
        },{
          id: 3,
          name: "Calafia",
          uen: "Mexicali",
          picture: "calafia.jpg",
          progress: 59,
          estimates: [4]
        }]

        setTimeout(() => {
          resolve(projectsFetchedFromDB)
        }, 10);
        
      })
    }

  }
}