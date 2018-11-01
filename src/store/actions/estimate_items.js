export const addEstimateItem = (estimate_item) => ({
  type    : 'ADD_ESTIMATE_ITEM',
  payload : estimate_item
})

export const selectEstimateItem = (id) => ({
  type    : 'SELECT_ESTIMATE_ITEM',
  payload : id
})

export const clearEstimateItem = () => ({
  type    : 'CLEAR_ESTIMATE_ITEM',
  payload : {}
})


export const loadEstimateItems = () => {
  return {

    type: 'LOAD_ESTIMATE_ITEMS',

    callAPI: () => {
      return new Promise((resolve, reject) => {

        const items = [{
          id: 1,
          parent_id: null,
          line_item_id: null,
          is_disable: false,
          code: "01",
          description: 'Requerimientos generales',
          quantity: null,
          indirect_percentage: 0,
          is_line_item: false
        },{
          id: 2,
          parent_id: 1,
          line_item_id: null,
          is_disable: false,
          code: "01.01",
          description: 'Diseno',
          quantity: 1000,
          indirect_percentage: 0,
          is_line_item: true
        },{
          id: 3,
          parent_id: null,
          line_item_id: null,
          is_disable: false,
          code: "03",
          description: 'Concretos',
          quantity: null,
          indirect_percentage: 0,
          is_line_item: false
        },{
          id: 4,
          parent_id: 3,
          line_item_id: null,
          is_disable: false,
          code: "03.01",
          description: 'Cimentaciones',
          quantity: null,
          indirect_percentage: 0,
          is_line_item: false
        },{
          id: 5,
          parent_id: 4,
          line_item_id: null,
          is_disable: false,
          code: "03.01.01",
          description: 'Superficiales',
          quantity: null,
          indirect_percentage: 0,
          is_line_item: false
        },{
          id: 6,
          parent_id: 5,
          line_item_id: null,
          is_disable: false,
          code: "03.01.01.01",
          description: 'Zapata 20x20',
          quantity: 120,
          indirect_percentage: 0,
          is_line_item: true
        },{
          id: 7,
          parent_id: 5,
          line_item_id: null,
          is_disable: false,
          code: "03.01.01.02",
          description: 'Zapata 40x40',
          quantity: 210,
          indirect_percentage: 0,
          is_line_item: true
        }]

        resolve(items)
      })
    }

  }
}