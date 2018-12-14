
  const findRowByIdAndUpdated = (rows, id, action) => {
    let result 
    return rows.map(element => {
      if(element.id === id){
  
        element = action(element)
        result = true
      }
      
      if(!result){
  
        if(element.hasOwnProperty('subrows')){
          element.subrows = findRowByIdAndUpdated(element.subrows, id, action)
        }    
      }
  
      return element
    });
  }

  const map = (rows, action) => {
    return rows.map(element => {
   
      element = action(element)
        
      if(element.hasOwnProperty('subrows')){
        element.subrows = map(element.subrows, action)
      }    
      
      return element
    });
  }

  const convertArrayInTree = (rows) => {
    //  A couple of rules to add rows.
    //  1.- If parent_id is null it means the row goes to the higher level.
    //  2.- If parent_id is not found
    //  TODO: if parent_id is not found it may have not been added yet. We can create a pending rows array and loop until its empty

    let treeRows = []
    rows.forEach(row => {
      
      if(!row.hasOwnProperty('is_selected')){
        row.is_selected = false
      }

      if(!row.hasOwnProperty('is_open')){
        row.is_open = false
      }

      if(!row.hasOwnProperty('subrows')){
        row.subrows = []
      }


      if(row.parent_id == null){
        treeRows.push(row)
      }else{
        treeRows = findRowByIdAndUpdated(treeRows, row.parent_id, element => {
          if(!element.hasOwnProperty('subrows')){
            element = {
              ...element,
              subrows : []
            }
          }
          element.subrows.push(row) 

          return element
        })        
      }
      
    })

    return treeRows
  }

  export default {
    findRowByIdAndUpdated,
    convertArrayInTree,
    map
  }
