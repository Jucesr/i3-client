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