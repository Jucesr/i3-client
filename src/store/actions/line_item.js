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

export const selectLineItem = (id) => ({
  type    : 'SELECT_LINE_ITEM',
  payload : id
})

export const clearLineItem = () => ({
  type    : 'CLEAR_LINE_ITEM',
  payload : {}
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


export const loadLineItems = () => {
  return {

    type: 'LOAD_LINE_ITEMS',

    callAPI: () => {
      return new Promise((resolve, reject) => {

        const items = [{
          id: 1,
          code: "01",
          description: {
            es: 'Diseño estructural',
            en: 'Design'
          },
          uom: 'lote',
          unit_rate: 1200
        },{
          id: 2,
          code: "01",
          description: {
            es: 'Zapata 20x20',
            en: 'Footing 20x20'
          },
          uom: 'ml',
          unit_rate: 59
        },{
          id: 3,
          code: "01",
          description: {
            es: 'Zapata 40x40',
            en: 'Footing 40x40'
          },
          uom: 'ml',
          unit_rate: 64
        }]

        resolve(items)
      })
    }

  }
}