import pick from 'lodash/pick'
import { loadLineItemById } from "./line_item";

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
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(
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
        .then(
          response => {
            if(response.status == 400)
              reject(response)
          return response.json() 
          }
        )
        .then(response => {
          let estimate_item = pick(response, [
            'id',
            'parent_id',
            'is_disable',
            'is_line_item',
            'line_item_id',
            'code',
            'description',
            'quantity',
            'indirect_percentage',
          ])

          // //  If the Estimate item is a LI and it has changed it should fetch the new one
          // if(estimate_item.is_line_item){
          //   dispatch(loadLineItemById(estimate_item.line_item_id))
          // }

          resolve(estimate_item) 
          })
    })
  }
})

export const deleteEstimateItem = (estimate_item) => ({
  type    : 'DELETE_ESTIMATE_ITEM',
  payload : estimate_item.estimate_id,
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(
          `${API_URL}/estimate_item/${estimate_item.id}`, 
          {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }
          }
        )
        .then(
          response => {
            if(response.status == 400)
              reject(response)
          return response.json() 
          }
        )
        .then(response => {
          resolve(estimate_item.id) 
        })
    })
  }
})

export const updateEstimateItemById = (id, estimate_item) => ({
  type: 'UPDATE_ESTIMATE_ITEM',
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(
          `${API_URL}/estimate_item/${id}`, 
          {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(estimate_item)
          }
        )
        .then(
          response => {
            if(response.status == 404)
              reject('Not found')
          return response.json() 
          }
        )
        .then(response => {
          let estimate_item = pick(response, [
            'id',
            'line_item_id',
            'parent_id',
            'is_disable',
            'code',
            'description',
            'quantity',
            'indirect_percentage',
            'is_line_item'
          ])

          //  If the Estimate item is a LI and it has changed it should fetch the new one
          if(estimate_item.is_line_item){
            dispatch(loadLineItemById(estimate_item.line_item_id))
          }

          resolve(estimate_item) 
          })
    })
  }
})

export const selectEstimateItem = (id) => ({
  type    : 'SELECT_ESTIMATE_ITEM',
  payload : id
})

export const loadEstimateItemById = (id) => {
  return {

    type: 'LOAD_ESTIMATE_ITEM',
    shouldCallAPI: shouldCallAPI('estimate_items', id),
    callAPI: (dispatch) => {
      return new Promise((resolve, reject) => {

        fetch(`${API_URL}/estimate_item/${id}`)
          .then(
            response => {
              if(response.status == 404)
                reject('Not found')
            return response.json() 
            }
          )
          .then(response => {

            let estimate_item = pick(response, [
              'id',
              'line_item_id',
              'parent_id',
              'code',
              'description',
              'quantity',
              'indirect_percentage',
              'is_line_item'
            ])

            //  If the Estimate item is a LI it should get the LI from the database.
            if(estimate_item.is_line_item){
              dispatch(loadLineItemById(estimate_item.line_item_id))
            }

            resolve(estimate_item) 
            })
      })
    }

  }
}

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

          estimate_items = estimate_items.map(
            item => {
              let estimate_item = pick(item, [
                'id',
                'line_item_id',
                'parent_id',
                'code',
                'description',
                'quantity',
                'indirect_percentage',
                'is_line_item'
              ])

              //  If the Estimate item is a LI it should get the LI from the database.
              if(estimate_item.is_line_item && !!estimate_item.line_item_id){
                dispatch(loadLineItemById(estimate_item.line_item_id))
              }

              return estimate_item   
            }
          )
          resolve(estimate_items) 
          })
    })
  }
})
