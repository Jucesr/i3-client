export const addProject = (project) => ({
    type    : 'ADD_PROJECT',
    payload : project
})

export const loadProjects = () => {
  return {

    type: 'LOAD_PROJECTS',

    callAPI: () => {
      return new Promise((resolve, reject) => {

        const projectsFetchedFromDB = [{
          id: 1,
          name: 'My awesome boilerplate'
        },{
          id: 2,
          name: 'My plan to stop whitewalkers'
        }]

        setTimeout(() => {
          resolve(projectsFetchedFromDB)
        }, 3000);
        
      })
    }

  }
}