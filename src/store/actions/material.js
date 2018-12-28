import pick from 'lodash/pick'
import { fetchApi } from "utils/api"

export const loadMaterial = (id) => ({
  type    : 'LOAD_MATERIAL',
  callAPI: async dispatch => {
    let material = await fetchApi(`${API_URL}/material/${id}`)
    return pick(material, [
      "id",
      'parent_id',
      'is_item',
      "is_service",
      "code",
      "description",
      "uom",
      "currency",
      "unit_rate",
    ])
  }
})

export const loadMaterials = (project_id) => ({
  type    : 'LOAD_MATERIALS',
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
    ]))
     
  }
})

export const unloadMaterials = () => ({
  type    : 'UNLOAD_MATERIALS'
})
