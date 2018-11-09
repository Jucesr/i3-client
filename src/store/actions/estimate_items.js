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
  payload : estimate_item
})

// export const selectEstimateItem = (id) => {
//   return (dispatch, getState) => {
//     dispatch({
//       type    : 'SELECT_ESTIMATE_ITEM',
//       payload : id
//     })
//     let state = getState().estimates
//     let estimate_items = state.items[id].items

//     estimate_items.forEach(element => {
//       dispatch(loadEstimateItemById(element))
//     });
//   }
// }

export const selectEstimateItem = (id) => ({
  type    : 'SELECT_ESTIMATE_ITEM',
  payload : id
})


export const clearEstimateItem = () => ({
  type    : 'CLEAR_ESTIMATE_ITEM',
  payload : {}
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