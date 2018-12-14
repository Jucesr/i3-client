import pick from 'lodash/pick'

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

export const loadLineItemDetailsById = (id) => ({
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
  callAPI: () => {
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/line_item/${id}/detail`)
        .then(
          response => {
            if(response.status == 404)
              reject('Not found')
          return response.json() 
          }
        )
        .then(response => {

          // let line_item_detail = pick(response, [
          //   'id',
          //   'is_assembly',
          //   'entity_id',
          //   'entity_code',
          //   'description',
          //   'uom',
          //   'quantity',
          //   'unit_rate_mxn',
          //   'unit_rate_usd'
          // ])

          resolve(response) 
          })
    })
  }
})

export const updateLineItemDetailById = (ids, line_item_detail) => ({
  type: 'UPDATE_LINE_ITEM_DETAIL',
  // shouldCallAPI: shouldCallAPI('estimate_items', id),
  payload: ids.line_item,
  callAPI: (dispatch) => {
    return new Promise((resolve, reject) => {
      fetch(
          `${API_URL}/line_item/${ids.line_item}/detail/${ids.line_item_detail}`, 
          {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(line_item_detail)
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
          let lid = pick(response, [
            'id',
            'quantity',
            'formula'
          ])

          //  TODO: Should fetch all Line entities that were affected
          // if(estimate_item.is_line_item){
          
          dispatch(loadLineItemById(ids.line_item, {force: true}))
          // }

          resolve(lid) 
          })
    })
  }
})



