import pick from 'lodash/pick'
import { fetchApi } from "utils/api"
import { loadLineItem } from "./line_item";

const shouldCallAPI = (stateProperty, _id) => {
  return state => {
    if(!state[stateProperty].items[_id])
      return true

    const days = 3;
    const miliseconds_in_day = 86400000;  
    const timeToStale = days * miliseconds_in_day;  
    const timeSinceLastFetch = Date.now() - state[stateProperty].items[_id].lastFetched;
    const shouldFetch = (timeSinceLastFetch) > timeToStale;
    return shouldFetch 

  }
}

export const addEstimateItem = (estimate_item) => ({
  type    : 'ADD_ESTIMATE_ITEM',
  payload : estimate_item.estimate_id,
  callAPI: async dispatch => {
    estimate_item = await fetchApi(
      `${API_URL}/estimate_item/`, 
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimate_item)
      }
    )
    estimate_item = pick(estimate_item, [
      'id',
      'parent_id',
      'is_disable',
      'is_item',
      'line_item_id',
      'code',
      'description',
      'quantity',
      'indirect_percentage',
    ])

    return estimate_item

  }
})

export const deleteEstimateItem = (estimate_item) => ({
  type    : 'DELETE_ESTIMATE_ITEM',
  payload : estimate_item.estimate_id,
  callAPI: async (dispatch) => {
    estimate_item = await fetchApi(
      `${API_URL}/estimate_item/${estimate_item.id}`, 
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      }
    )
    return estimate_item.id
  }
})

export const updateEstimateItem = (estimate_item) => ({
  type: 'UPDATE_ESTIMATE_ITEM',
  payload : estimate_item.estimate_id,
  callAPI: async (dispatch) => {
    estimate_item = await fetchApi(
      `${API_URL}/estimate_item/${estimate_item.id}`, 
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimate_item)
      }
    )
        
    estimate_item = pick(estimate_item, [
      'id',
      'line_item_id',
      'parent_id',
      'is_disable',
      'code',
      'description',
      'quantity',
      'indirect_percentage',
      'is_item'
    ])
    
    return estimate_item
  }
})

//  It fetches all the estimate items of an Estimate at once. 
export const loadEstimateItems = (estimate_id) => ({
  type: 'LOAD_ESTIMATE_ITEMS',
  payload: estimate_id,
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/estimate/${estimate_id}/estimate_items`)
        .then(
          response => {
            if(response.status != 200)
              reject(response)
          return response.json() 
          }
        )
        .then(estimate_items => {
          //  Once it has fetched all the estimate items, It will check if it needs to fetch a line item
          let array_of_line_items_request = []

          estimate_items = estimate_items.map(
            item => {
              let estimate_item = pick(item, [
                'id',
                'line_item_id',
                'parent_id',
                'is_disable',
                'code',
                'description',
                'quantity',
                'indirect_percentage',
                'is_item'
              ])

              //  If the Estimate item is a LI it should fetch the LI from the database.
              
              if(estimate_item.is_item && !!estimate_item.line_item_id){
                let action = loadLineItem(estimate_item.line_item_id)
                
                array_of_line_items_request.push(dispatch(action))
              }

              return estimate_item   
            }
          )
          //  Once al line items have been fetched it resolve the action.
          Promise.all(array_of_line_items_request).then( items => {
            resolve(estimate_items) 
          })

          
          })
    })
  }
})
