const raw = {
  1: {
    id: 1,
    parent_id: null,
    code: "01",
    description: 'Requerimientos generales',
    quantity: null,
    indirect_percentage: 0
  },
  2: {
    id: 2,
    parent_id: 1,
    code: "01.01",
    description: 'Diseno',
    quantity: 1000,
    indirect_percentage: 0,
    is_line_item: true
  },
  3: {
    id: 3,
    parent_id: null,
    code: "03",
    description: 'Concretos',
    quantity: null,
    indirect_percentage: 0
  },
  4: {
    id: 4,
    parent_id: 3,
    code: "03.01",
    description: 'Cimentaciones',
    quantity: null,
    indirect_percentage: 0
  },
  5:{
    id: 5,
    parent_id: 4,
    code: "03.01.01",
    description: 'Superficiales',
    quantity: null,
    indirect_percentage: 0
  },
  6: {
    id: 6,
    parent_id: 5,
    code: "03.01.01.01",
    description: 'Zapata 20x20',
    quantity: 120,
    indirect_percentage: 0,
    is_line_item: true
  },
  7: {
    id: 7,
    parent_id: 5,
    code: "03.01.01.02",
    description: 'Zapata 40x40',
    quantity: 210,
    indirect_percentage: 0,
    is_line_item: true
  }
}

// -----------------------------------------------------------------

const getStructure = ( current, parent_id ) => {
  if(parent_id != null){
    let element = raw[parent_id]
    current.push(element)
    return getStructure(current, element.parent_id)  
  }else{
    return current
  }
}

const new_items = Object.keys(raw).reduce( (current, key) => {
  let line_item = raw[key];

  //  If it is a line item and not a section
  if(line_item.is_line_item == true){
    //  Check for parent id
    let structure = getStructure([], line_item.parent_id)

    structure = structure.reverse()

    let structure_object = structure.reduce((current, item, index) => {
      current[`level_${index}`] = {
        code: item.code,
        description: item.description
      }

      return current
    }, {})

    line_item.structure = structure_object

    delete line_item.parent_id

    current.push(line_item)
  }
  
  return current
}, [])

console.log(new_items)



// -----------------------------------------------------------------
