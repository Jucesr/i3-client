import pick from 'lodash/pick'

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

export const addLineItem = (estimate_item) => ({
  type    : 'ADD_LINE_ITEM',
  payload : estimate_item
})

export const loadLineItemById = (id) => ({
  type: 'LOAD_LINE_ITEM',
  shouldCallAPI: shouldCallAPI('line_items', id),
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
})

export const loadLineItemDetailsById = (id) => ({
  type: 'LOAD_LINE_ITEM_DETAILS',
  shouldCallAPI: state => {
      if(!state['line_items'].items[id].line_item_details)
        return true
  
      const days = 3;
      const miliseconds_in_day = 86400000;  
      const timeToStale = days * miliseconds_in_day;  
      const timeSinceLastFetch = Date.now() - state['line_items'].items[id].lastFetched;
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

