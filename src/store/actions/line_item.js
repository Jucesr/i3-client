import pick from 'lodash/pick'
import { fetchApi } from "utils/api"
import { loadMaterial } from "./material";

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

export const addLineItem = (estimate_item) => ({
  type    : 'ADD_LINE_ITEM',
  payload : estimate_item
})

export const loadLineItemById = (id, options = {}) => {

  const {force = false} = options

  return {
    type: 'LOAD_LINE_ITEM',
    shouldCallAPI: force ? undefined : shouldCallAPI('line_items', id),
    callAPI: () => {
      return new Promise((resolve, reject) => {

        fetch(`${API_URL}/line_item/${id}`)
          .then(
            response => {
              if(response.status == 404)
                reject('Not found')
            return response.json() 
            }
          )
          .then(response => {

            let line_item = pick(response, [
              'id',
              'code',
              'spanish_description',
              'english_description',
              'uom',
              'unit_rate_mxn',
              'unit_rate_usd'
            ])

            line_item.description = {
              es: line_item.spanish_description,
              en: line_item.english_description,
            }

            resolve(line_item) 
            })
      })
    }
  }
}

export const loadLineItemWithDetailById = (id, options = {}) => {

  const {force = false} = options
  let line_items;
  return {
    type: 'LOAD_LINE_ITEM',
    shouldCallAPI: force ? undefined : shouldCallAPI('line_items', id),
    callAPI: async (dispatch) => {

      let line_item = await fetchApi(`${API_URL}/line_item/${id}`)

      line_item = pick(line_item, [
        'id',
        'code',
        'spanish_description',
        'english_description',
        'uom',
        'unit_rate_mxn',
        'unit_rate_usd'
      ])

      line_item.description = {
        es: line_item.spanish_description,
        en: line_item.english_description,
      }

      //  Get details of the line item

      let details = await fetchApi(`${API_URL}/line_item/${id}/detail`)
      
      line_item.line_item_details = details

      return line_item

      
    }
  }
}

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
        await dispatch(loadLineItemById(lid.entity_id))
        
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



