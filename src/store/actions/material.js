import pick from 'lodash/pick'
import { fetchApi } from "utils/api"

const fields = [
  'id',
  'project_id',
  'parent_id',
  'is_item',
  'is_service',
  'code',
  'description',
  'uom',
  'currency',
  'base_cost',
  'other_cost',
  'waste_cost',
  'unit_rate'
]

export const addMaterial = (material) => ({
  type    : 'ADD_MATERIAL',
  callAPI: async dispatch => {

    material = await fetchApi(
      `${API_URL}/material/`, 
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(material)
      }
    )
    
    return pick(material, fields)
  }
})

export const deleteMaterial = (material) => ({
  type    : 'DELETE_MATERIAL',
  callAPI: async (dispatch) => {
    material = await fetchApi(
      `${API_URL}/material/${material.id}`, 
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      }
    )
    return material.id
  }
})

export const updateMaterial = (material) => ({
  type: 'UPDATE_MATERIAL',
  callAPI: async (dispatch) => {
    material = await fetchApi(
      `${API_URL}/material/${material.id}`, 
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(material)
      }
    )
        
    material = pick(material, fields)
    
    return material
  }
})

export const importMaterial = (project_id, material) => ({
  type    : 'IMPORT_MATERIAL',
  callAPI: async dispatch => {
    material = await fetchApi(
      `${API_URL}/material/${material.id}/copyTo/${project_id}`, 
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(material)
      }
    )

    return pick(material, fields)
  }
})

export const loadMaterial = (id) => ({
  type    : 'LOAD_MATERIAL',
  callAPI: async dispatch => {
    let material = await fetchApi(`${API_URL}/material/${id}`)

    //  Check if the material that will be load has a parent.
    if(material.parent_id != null){
      await dispatch(loadMaterial(material.parent_id))
    }

    return pick(material, fields)
  }
})

export const loadMaterialByCode = (project_id, code) => ({
  type    : 'LOAD_MATERIAL',
  callAPI: async dispatch => {
    let material = await fetchApi(`${API_URL}/project/${project_id}/materials/${code}`)

    //  Check if the material that will be load has a parent.
    if(material.parent_id != null){
      await dispatch(loadMaterial(material.parent_id))
    }

    return pick(material, fields)
  }
})

export const loadMaterials = (project_id) => ({
  type    : 'LOAD_MATERIALS',
  callAPI: async dispatch => {
    let materials = await fetchApi(`${API_URL}/project/${project_id}/materials/`)
    return materials.map(material => pick(material, fields))
     
  }
})

export const unloadMaterials = () => ({
  type    : 'UNLOAD_MATERIALS'
})
