import pick from 'lodash/pick'
import { fetchApi } from "utils/api"

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
  callAPI: async dispatch => {
  
      let projects = await fetchApi(`${API_URL}/project/`)

      return projects.map(project => pick(project, [
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
      ]))
  }
})

