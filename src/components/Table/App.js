import React, { Component } from 'react';
import pick from 'lodash/pick'
import './App.css';

import Table from "./Table";

class App extends Component {

  constructor(props){
    super(props)
    this.API_URL = 'http://172.16.17.245:3000'
    this.state = {
      rows: [],
      is_fetching_items: false,
      materials: [],
      selected_rows: [],
      details: [],
      line_item_details: {},
      should_update_database: false
    }
  }
  componentDidMount = () => {

    this.setState(prevState => ({
      is_fetching_items: true
    }))

    fetch(`${this.API_URL}/estimate/2/estimate_items`)
      .then(data => data.json())
      .then(rows => {
        rows = rows.map(row => {
          if(row.is_line_item && !!row.line_item_id){
            return fetch(`${this.API_URL}/line_item/${row.line_item_id}`)
            .then(data => data.json())
            .then(line_item => {
              return {
                ...row,
                uom: line_item.uom,
                unit_rate: line_item.unit_rate_mxn + (line_item.unit_rate_usd * 20),
                total: (line_item.unit_rate_mxn + (line_item.unit_rate_usd * 20)) * row.quantity
              }
            })
          }else{
            return new Promise((resolve, reject) => {
              resolve(row)
            })
          }

          
          
        })
        Promise.all(rows).then(rows => {
          //console.log(rows)
          this.setState(prevState => ({
            rows: this.calculateTotals(this.convertRowsInTree(rows)),
            is_fetching_items: false
          }))
        })
      })

    fetch(`${this.API_URL}/project/1/materials`)
      .then(data => data.json())
      .then(rows => {
        this.setState(prevState => ({
          materials: rows.map(row => ({
            ...row,
            is_line_item: true
          }))
        }))
      })

    
  }

  addLineItems = (line_item_id, rows) => {
    this.setState( prevState => ({
      line_item_details: {
        ...prevState.line_item_details,
        [line_item_id]: rows
      }
    }))
  }

  convertRowsInTree = (rows) => {
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
        treeRows = this.findRowByIdAndUpdated(treeRows, row.parent_id, element => {
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

  calculateTotals = (rows) => {

    return rows.map(row => {

      //  Check if it is a header and have subrows, it means it needs to go deeper
      if(row.hasOwnProperty('subrows') && !row.is_line_item){

        row.subrows = this.calculateTotals(row.subrows)

        row.total = row.subrows.reduce((acum, item) => {
          return acum + (isNaN(item.total) ? 0 : item.total)
        }, 0)

      }
        
      return row

    })

  }

  findRowByID = (rows, id) => {
    let result 
    rows.forEach(element => {
      if(element.id === id){
        result = element
      }
      
      if(!result){
  
        if(element.hasOwnProperty('subrows')){
          result = this.findRowByID(element.subrows, id)
        }
        
      }
  
    });
  
    return result
  }

  findRowByIdAndUpdated = (rows, id, action) => {
    let result 
    return rows.map(element => {
      if(element.id === id){
  
        element = action(element)
        result = true
      }
      
      if(!result){
  
        if(element.hasOwnProperty('subrows')){
          element.subrows = this.findRowByIdAndUpdated(element.subrows, id, action)
        }    
      }
  
      return element
    });
  }

  findOneAndDelete = (rows, id) => {
    
    return rows.filter(element => {
      if(element.id === id){
        return false
      }

      if(element.hasOwnProperty('subrows')){
        element.subrows = this.findOneAndDelete(element.subrows, id)
      }

      return true

    });
  }

  onRowClick = row => {

    // if(row.is_line_item){
    //   fetch(`${this.API_URL}/line_item/${row.line_item_id}/detail`)
    //   .then(data => data.json())
    //   .then(rows => {

    //     this.setState(prevState => ({
    //       details: rows.map(row => ({
    //         ...row,
    //         is_line_item: !row.is_assembly,
    //         is_open: false
    //       }))
    //     }))
    //   })
      
    // }
    
  }

  onRowRightClick = row => {
    
  }

  onUpdateRow = (column, row, value) => {
    
    if(column.assesor == 'quantity'){
  
      value = parseFloat(value)

      this.setState(prevState => {

        let new_rows = this.findRowByIdAndUpdated(prevState.rows, row.id, (element) => ({
          ...element,
          quantity: value,
          total: value * element.unit_rate
        }))

        new_rows = this.calculateTotals(new_rows)
        
        return {
          rows: new_rows
        }
      
      })
    }else{
      this.setState(prevState => ({
        rows: this.findRowByIdAndUpdated(prevState.rows, row.id, (element) => ({
          ...element,
          [column.assesor]: value
        }))
      }))
    }
  }

  onAddRow = row => {
    
    let hasSubrows = row.hasOwnProperty('subrows')

    //  Generate code for new line item.
    let new_code
    if(hasSubrows && row.subrows.length > 0){
      let last_row_code = row.subrows[row.subrows.length - 1].code
      let codes = last_row_code.split('.')
      let code_num = parseInt(codes[codes.length - 1], 10) + 1

      new_code = row.code + `.` + code_num.toString().padStart(2,'0')
      //  TODO: Handle renumbering rows when deleting a row.
    }else{
      new_code = row.code + '.00'
    }

    this.addEstimateItem({
      parent_id: row.id,
      code: new_code,
      description: ' ',
      quantity: 0,
      is_line_item: true
    })

  }

  onAddHeader = row => {
    //  Find parent to generate code for the new row.
    let new_code
    let parent_id
    if(!!row.parent_id){
      parent_id = row.parent_id

      let parent_row = this.findRowByID(this.state.rows, row.parent_id)

      let last_row_code = parent_row.subrows[parent_row.subrows.length - 1].code
      let codes = last_row_code.split('.')
      let code_num = parseInt(codes[codes.length - 1], 10) + 1
      codes.pop()
      new_code = codes.join('.') + `.` + code_num.toString().padStart(2,'0')
    }else{
      parent_id = null

      let rows = this.state.rows
      let last_row_code = rows[rows.length - 1].code
      let codes = last_row_code.split('.')
      let code_num = parseInt(codes[codes.length - 1], 10) + 1
      new_code = code_num.toString().padStart(2,'0')
    }

    this.addEstimateItem({
      parent_id: parent_id,
      code: new_code,
      description: 'Header',
      quantity: 0,
      is_line_item: false
    })
  }

  onAddSubHeader = row => {

    //  Generate code for new line item.
    let new_code
    if(row.hasOwnProperty('subrows')){
      let last_row_code = row.subrows[row.subrows.length - 1].code
      let codes = last_row_code.split('.')
      let code_num = parseInt(codes[codes.length - 1], 10) + 1

      new_code = row.code + `.` + code_num.toString().padStart(2,'0')
      //  TODO: Handle renumbering rows when deleting a row.
    }else{
      new_code = row.code + '.00'
    }

    this.addEstimateItem({
      parent_id: row.id,
      code: new_code,
      description: 'Sub Header',
      quantity: 0,
      is_line_item: false
    })


  }

  onDeleteRow = row => {

    fetch(
      `${this.API_URL}/estimate_item/${row.id}`, 
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
        // if(response.status == 400)
        //   reject(response)
      return response.json() 
      }
    )
    .then(response => {

      this.setState(prevState => ({
        rows: this.calculateTotals(this.findOneAndDelete(prevState.rows, row.id))
      }))

    })

  }

  onDeleteHeader = row => {
    this.setState(prevState => ({
      rows: this.calculateTotals(this.findOneAndDelete(prevState.rows, row.id))
    }))
  }

  addEstimateItem = row => {
    const estimate_item = {
      project_id: 1,
      estimate_id: 2,
      line_item_id: null,
      wbs_item_id: null,
      is_disable: false,
      hierachy_level: 1,
      indirect_percentage: 0,
      ...row
    }

    if(!!estimate_item.parent_id){
      this.setState(prevState => ({
        rows: this.findRowByIdAndUpdated(prevState.rows, estimate_item.parent_id, element => {
          if(!element.hasOwnProperty('subrows')){
            element.subrows = []
          }
          element.subrows = element.subrows.concat(estimate_item)
          return element
        })
      }))
    }else{
      //  It goes to the higher level
      this.setState(prevState => ({
        rows: prevState.rows.concat(estimate_item) 
      }))
    }


    // fetch(
    //   `${this.API_URL}/estimate_item/`, 
    //   {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(estimate_item)
    //   }
    // )
    // .then(
    //   response => {
    //     // if(response.status == 400)
    //     //   reject(response)
    //   return response.json() 
    //   }
    // )
    // .then(response => {
    //   let estimate_item = pick(response, [
    //     'id',
    //     'parent_id',
    //     'is_disable',
    //     'is_line_item',
    //     'line_item_id',
    //     'code',
    //     'description',
    //     'quantity',
    //     'indirect_percentage',
    //   ])

    //     if(!!estimate_item.parent_id){
    //       this.setState(prevState => ({
    //         rows: this.findRowByIdAndUpdated(prevState.rows, estimate_item.parent_id, element => {
    //           if(!element.hasOwnProperty('subrows')){
    //             element.subrows = []
    //           }
    //           element.subrows = element.subrows.concat(estimate_item)
    //           return element
    //         })
    //       }))
    //     }else{
    //       //  It goes to the higher level
    //       this.setState(prevState => ({
    //         rows: prevState.rows.concat(estimate_item) 
    //       }))
    //     }

        

    //   })
  }

  onRowExpand = (row) => {
      if(!!row.subrows){

        this.setState(prevState => ({
          rows: this.findRowByIdAndUpdated(prevState.rows, row.id, element => ({
            ...element,
            is_open: !element.is_open
          }))
        }))
      }

      if(row.is_line_item){
        fetch(`${this.API_URL}/line_item/${row.line_item_id}/detail`)
          .then(data => data.json())
          .then(rows => {

            this.setState(prevState => ({
              details: rows.map(row => ({
                ...row,
                is_line_item: !row.is_assembly,
                is_open: false
              }))
            }))
          })
      }
  }

  onRowSelect = rows => {
    this.setState(prevState => ({
      selected_rows: rows
    }))
  }

  moveRow = (drag_row, drop_row) => {
    
    //  Remove row from it's current parent
    let news = this.findRowByIdAndUpdated(this.state.rows, drag_row.parent_id, (element => {
      return {
        ...element,
        subrows: element.subrows.filter( item => item.id !== drag_row.id)
      }
    }))

    //  Add row to new location

    let new_code
  
    if(drop_row.hasOwnProperty('subrows') && drop_row.subrows.length > 0 ){

      let last_row_code = drop_row.subrows[drop_row.subrows.length - 1].code
      let codes = last_row_code.split('.')
      let code_num = parseInt(codes[codes.length - 1], 10) + 1

      new_code = drop_row.code + `.` + code_num.toString().padStart(2,'0')
    }else{
      new_code = drop_row.code + '.00'
    }
 
    news = this.findRowByIdAndUpdated(news, drop_row.id, (element => {
      return {
        ...element,
        subrows: element.subrows.concat({
          ...drag_row,
          code: new_code,
          parent_id: drop_row.id
        })
      }
    }))

    news = this.calculateTotals(news)

    this.setState(prevState => ({
      rows: news
    }))

  }

  render() {
    return (
      <div className="App">
        <div style={{
          height: '80vh'
        }}>
        <Table
          allowToDragRows={true}
          columns={[{
            Header: 'Code',
            assesor: 'code',
            width: 100
            //filter: true
          },{
            Header: 'Description',
            assesor: 'description',
            editable: true,
            format: 'textarea',
            width: 800
            //filter: true
          },{
            Header: 'UOM',
            assesor: 'uom',
            width: 100,
          },{
            Header: 'Quantity',
            assesor: 'quantity',
            editable: true,
            format: {
              type: 'number',
              decimals: 2
            },
            width: 150,
            onlyItems: true
          },{
            Header: 'Unit rate',
            assesor: 'unit_rate',
            format: 'currency'
          },{
            Header: 'Total',
            assesor: 'total',
            format: 'currency'
            
          }]}
          isLoading={this.state.is_fetching_items}
          rows={this.state.rows}
          selected_rows={this.state.selected_rows}
          onRowClick={this.onRowClick}
          onUpdateRow={this.onUpdateRow}
          onAddRow={this.onAddRow}
          onAddHeader={this.onAddHeader}
          onAddSubHeader={this.onAddSubHeader}
          onDeleteRow={this.onDeleteRow}
          onDeleteHeader={this.onDeleteHeader}
          onRowExpand={this.onRowExpand}
          onRowSelect={this.onRowSelect}
          onMoveRow={this.moveRow}
        />
        </div>
        


        {/* <Table
          columns={[{
            Header: 'Code',
            assesor: 'code',
            width: 100,
          },{
            Header: 'Description',
            assesor: 'description',
            width: 800,
            filter: true
          },{
            Header: 'UOM',
            assesor: 'uom',
            width: 100,
          },{
            Header: 'Unit rate',
            assesor: 'unit_rate',
            width: 100,
          }]}
          rows={this.state.materials}
          allowToDragRows={true}
        /> */}
        
        {/* <Table
        
          columns={[{
            Header: 'Code',
            assesor: 'code',
            width: 100,
          },{
            Header: 'Description',
            assesor: 'description',
            Cell: row => <div className="description"> {row.description} </div>,
            width: 800,
            //filter: true
          },{
            Header: 'UOM',
            assesor: 'uom',
            width: 100,
          },{
            Header: 'Quantity',
            assesor: 'quantity',
            Cell: row => 
              <QuantityInput 
                quantityValue={parseFloat(row.quantity)}
                onBlur={quantity => {
                  console.log(quantity)
                  //this.props.save_line_item(row.original.id, {quantity})
                }}
              />,
            format: 'number',
            width: 150,
          },{
            Header: 'Unit rate',
            assesor: 'unit_rate',
            format: 'currency'
          },{
            Header: 'Total',
            assesor: 'total',
            format: 'currency'
          }]}

          rows={this.state.details}

          onRowExpand={row => {   
            
            if(!row.is_line_item){

              //  Check if line item details have been loaded
              if(this.state.line_item_details.hasOwnProperty(row.entity_id)){

                const rows = this.state.line_item_details[row.entity_id]

                this.setState(prevState => ({
                  details: this.findRowByIdAndUpdated(prevState.details, row.id, (element => {
                    element.subrows = rows.map(row => ({
                      ...row,
                      is_line_item: !row.is_assembly,
                      is_open: false
                    }))
                    element.is_open = !element.is_open

                    return element
                  }))
                  
                }))
              }else{
                fetch(`${this.API_URL}/line_item/${row.entity_id}/detail`)
                .then(data => data.json())
                .then(rows => {
                  this.addLineItems(row.entity_id, rows)
                  this.setState(prevState => ({
                    details: this.findRowByIdAndUpdated(prevState.details, row.id, (element => {
                      element.subrows = rows.map(row => ({
                        ...row,
                        is_line_item: !row.is_assembly,
                        is_open: false
                      }))
                      element.is_open = !element.is_open

                      return element
                    }))
                    
                  }))
                })
              }

              
              
            }
              
          }}
        /> */}
      </div>
    );
  }
}

export default App;
