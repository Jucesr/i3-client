import pick from 'lodash/pick'
import { fetchApi } from "utils/api"

export const loadLineItems = (project_id) => ({
  type    : 'LOAD_LINE_ITEMS_IMPORT',
  callAPI: async dispatch => {
    let line_items = await fetchApi(`${API_URL}/project/${project_id}/line_items/`)
    return line_items.map(li => pick(li, [
      'id',
      'parent_id',
      'is_item',
      'code',
      'spanish_description',
      'english_description',
      'uom',
      'unit_rate_mxn',
      'unit_rate_usd',
      'project_id'
    ]))
     
  }
})

export const loadMaterials = (project_id) => ({
  type    : 'LOAD_MATERIALS_IMPORT',
  callAPI: async dispatch => {
    let materials = await fetchApi(`${API_URL}/project/${project_id}/materials/`)
    return materials.map(material => pick(material, [
      "id",
      'parent_id',
      'is_item',
      "is_service",
      "code",
      "description",
      "uom",
      "currency",
      "unit_rate",
      "project_id"
    ]))
     
  }
})

export const loadProjects = () => ({
  type    : 'LOAD_PROJECTS_IMPORT',
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