import pick from 'lodash/pick'
import { fetchApi, fetchWithError } from "utils/api"
import { loadMaterial } from "./material";

const li_fields = [
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
]

const shouldCallAPI = (stateProperty, _id) => {
  return state => {
    if(!state[stateProperty].entities[_id])
      return true

    const days = 3;
    const miliseconds_in_day = 86400000;  
    const timeToStale = days * miliseconds_in_day;  
    const timeSinceLastFetch = Date.now() - state[stateProperty].entities[_id].lastFetched;
    const shouldFetch = (timeSinceLastFetch) > timeToStale;
    return shouldFetch 

  }
}

export const addLineItemFromEstimateModule = (line_item) => {
    return async dispatch => {
      //  First it needs to check if there is already a section for line items that were not imported from Master Catalog.

      let section = await fetchWithError(`${API_URL}/project/${line_item.project_id}/line_items/99`)
      
      let parent_id
      if(section.hasOwnProperty('id')){
        //  It found it
        parent_id = section.id
      }else{
        //  It does not exits

        //  Create the section.
        let res = await dispatch(addLineItem({
          parent_id: null,
          is_item: 0,
          code: '99',
          spanish_description: 'Nuevos Conceptos',
          english_description: 'New Line Items',
          uom: null,
          project_id: line_item.project_id,
          wbs_item_id: null,
        }))
        parent_id = res.response.id
      }
      
      //  Create the line item
      return await dispatch(addLineItem({
        parent_id: parent_id,
        is_item: 1,
        code: '99.01',
        spanish_description: 'Sin descripcion',
        english_description: 'No description',
        uom: null,
        project_id: line_item.project_id,
        wbs_item_id: null,
      }))
    }
    
}

export const addLineItem = (line_item) => ({
  type    : 'ADD_LINE_ITEM',
  payload : line_item,
  callAPI: async () => {
    let new_line_item = await fetchApi(
      `${API_URL}/line_item/`, 
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(line_item)
      }
    )

    return new_line_item
  }
})

export const deleteLineItem = (line_item) => ({
  type    : 'DELETE_LINE_ITEM',
  payload : line_item.id,
  callAPI: async (dispatch) => {
    line_item = await fetchApi(
      `${API_URL}/line_item/${line_item.id}`, 
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      }
    )
    return line_item.id
  }
})

export const updateLineItem = (line_item) => ({
  type: 'UPDATE_LINE_ITEM',
  callAPI: async (dispatch) => {
    line_item = await fetchApi(
      `${API_URL}/line_item/${line_item.id}`, 
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(line_item)
      }
    )
        
    line_item = pick(line_item, [
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
    ])
    
    return line_item
  }
})

export const loadLineItem = (id, options = {}) => {

  const {force = false} = options

  return {
    type: 'LOAD_LINE_ITEM',
    shouldCallAPI: force ? undefined : shouldCallAPI('line_items', id),
    callAPI: async () => {

      let line_item = await fetchApi(`${API_URL}/line_item/${id}`)
      
      line_item = pick(line_item, li_fields)

      line_item.description = {
        es: line_item.spanish_description,
        en: line_item.english_description,
      }

      return line_item 
      
    }
  }
}

export const importLineItem = (project_id, line_item) => ({
  type    : 'IMPORT_LINE_ITEM',
  callAPI: async dispatch => {
    line_item = await fetchApi(
      `${API_URL}/line_item/${line_item.id}/copyTo/${project_id}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(line_item)
      }
      )
    return pick(line_item, li_fields)
  }
})

export const loadLineItems = (project_id) => ({
  type    : 'LOAD_LINE_ITEMS',
  callAPI: async dispatch => {
    let line_items = await fetchApi(`${API_URL}/project/${project_id}/line_items/`)
    return line_items.map(li => pick(li, li_fields))
     
  }
})

export const unloadLineItems = () => ({
  type    : 'UNLOAD_LINE_ITEMS'
})

// ***************************
//  LINE ITEM DETAILS ACTIONS
// ***************************

export const addLineItemDetail = (line_item_id, lid) => ({
  type    : 'ADD_LINE_ITEM_DETAIL',
  payload : line_item_id,
  callAPI: async () => {

    let new_lid = await fetchApi(
      `${API_URL}/line_item/${line_item_id}/detail`, 
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lid)
      }
    )

    return pick(new_lid, [
      'id',
      'is_assembly',
      'entity_id',
      'entity_code',
      'quantity'
  ])

  }
})

export const loadLineItemDetails = (id) => ({
  type: 'LOAD_LINE_ITEM_DETAILS',
  shouldCallAPI: state => {
      if(!state['line_items'].entities[id].line_item_details)
        return true
  
      const days = 3;
      const miliseconds_in_day = 86400000;  
      const timeToStale = days * miliseconds_in_day;  
      const timeSinceLastFetch = Date.now() - state['line_items'].entities[id].lastFetched;
      const shouldFetch = (timeSinceLastFetch) > timeToStale;
      return shouldFetch 
  
  },
  payload : id,
  callAPI: async (dispatch) => {
    
    let LIDs = await fetchApi(`${API_URL}/line_item/${id}/detail`)

    LIDs = LIDs.map(async lid => {
      
      if(lid.is_assembly){
        //  The lid is a line item
        await dispatch(loadLineItem(lid.entity_id))
        
      }else{
        //  The lid is a material
        await dispatch(loadMaterial(lid.entity_id))
      }
      
      return pick(lid, [
          'id',
          'is_assembly',
          'entity_id',
          'entity_code',
          'quantity'
      ])

    })
    return await Promise.all(LIDs)
    
  }
})

export const updateLineItemDetail = (line_item_id, line_item_detail) => ({
  type: 'UPDATE_LINE_ITEM_DETAIL',
  // shouldCallAPI: shouldCallAPI('estimate_items', id),
  payload: line_item_id,
  callAPI: async (dispatch, state) => {
    //  Steps to complete this action.
    //  1.- Update entity of line item detail
    //  2.- Update UR of line item that contains the LID.
    //  3.- Update UR of all the line items that depend on the previous LI

    // const line_item = state.line_items.entities[line_item_id]
    // const materials = state.materials.entities
    // const line_items = state.line_items.entities
    
    // const new_details = line_item.line_item_details.map( lid => {

    //   if(lid.id == line_item_detail.id){
    //     lid = {
    //       ...lid,
    //       ...line_item_detail
    //     }
    //   }

    //   if(lid.is_assembly){
    //     let LI = line_items[lid.entity_id]
    //     lid = {
    //       ...lid,
    //       unit_rate_mxn: LI.unit_rate_mxn,
    //       unit_rate_usd: LI.unit_rate_usd
    //     }
    //   }else{
    //     let material = materials[lid.entity_id]
    //     lid = {
    //       ...lid,
    //       unit_rate_mxn: material.currency == "MXN" ? material.unit_rate : 0,
    //       unit_rate_usd: material.currency == "USD" ? material.unit_rate : 0
    //     }
    //   }

    //   return lid
    // })

    // return details

    const new_detail = fetchApi(`${API_URL}/line_item/${lineItemID}/detail/${lineItemDetailID}`)
  }
})





