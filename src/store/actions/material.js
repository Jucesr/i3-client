import pick from 'lodash/pick'
import { fetchApi } from "utils/api"

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
      "project_id"
    ])
  }
})

export const copyMaterialToOtherProject = (material_id, project_id) => ({
  type    : 'COPY_MATERIAL',
  callAPI: async dispatch => {
    const material = await fetchApi(
      `${API_URL}/material/${material_id}/copyTo/${project_id}`, 
      {
        method: 'PUT'
      }
    )

    //  Check if the material that will be load has a parent.
    if(material.parent_id != null){
      console.log('WILL LOAD')
      await loadMaterial(material.parent_id)
      console.log('DONE')
    }

    
    
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
      "project_id"
    ])
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
      "project_id"
    ])
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
      "project_id"
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
      "project_id"
    ]))
     
  }
})

export const unloadMaterials = () => ({
  type    : 'UNLOAD_MATERIALS'
})
