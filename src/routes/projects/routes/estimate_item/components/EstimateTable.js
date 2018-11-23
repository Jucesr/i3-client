import React from 'react'
import PropTypes from 'prop-types'
import ReactTable from "react-table"
import ReactModal from 'react-modal'
import _ from 'lodash'
import ModalForm from './ModalForm'
import QuantityInput from './QuantityInput'
import RowActionsModal from './RowActionsModal'
import { formatColumn } from "utils";

import "react-table/react-table.css"

class EstimateTable extends React.Component {

  constructor(props){
    super(props);
    this.header_height = 0
    this.state = {
      row_actions_modal: {
        visible: false,
        x: 0,
        y: 0,
        actions: []
      },
      is_item: false,
      line_item: null,
      showEditForm: false,
      onSubmitModal: null
    }
    this.actions = {
      add_item: (row) => this.generateAction('Add line item', () => {
        let {code, level_3} = row
        
        if(code == '-'){
          code = level_3 + '.01'
        }else{
        
          let levels = code.split('.')
          let pos = levels.length - 1;
          levels[pos] = (parseInt(levels[pos]) + 1).toString().padStart(2,'0')
          code = levels.join('.')

        }
        this.setState((prevState) => ({
          showEditForm: true,
          onSubmitModal: this.onAddItem,
          is_item: true,
          line_item: {
            code,
            parent_id: row.parent_id,
            is_line_item: true,
          }
        }))
      }),
      add_header: (row) => this.generateAction('Add header', () => {
        
        let code = row._pivotVal
        let levels = code.split('.')
        let pos = levels.length - 1;
        levels[pos] = (parseInt(levels[pos]) + 1).toString().padStart(2,'0')
        code = levels.join('.')

        this.setState((prevState) => ({
          showEditForm: true,
          onSubmitModal: (values) => {
            //  Add Header
            this.props.addEstimateItem(values).then(res => {
              const parent_id = res.response.id

              //  Add line item
              this.props.addEstimateItem({
                ...values,
                code: '-',
                is_line_item: true,
                description: `${values.description} - empty line item`,
                parent_id
              })

              this.handleCloseModal()
            })
            
          },
          is_item: false,
          line_item: {
            code,
            parent_id: row.parent_id,
            quantity: 0,
            is_line_item: false
          }
        }))

        
      }),
      add_sub_header: (row) => this.generateAction('Add sub header', () => {
        let code = row._pivotVal
        let levels = code.split('.')
        let pos = levels.length - 1;
        levels[pos] = (parseInt(levels[pos]) + 1).toString().padStart(2,'0')
        code = levels.join('.')
        
        this.setState((prevState) => ({
          showEditForm: true,
          onSubmitModal: this.onAddItem,
          is_item: false,
          line_item: {
            code
          }
        }))
      }),
      delete_item: row => this.generateAction('Delete item', () => {
        this.props.deleteEstimateItem(row)
      }),
      edit_item: row => this.generateAction('Edit item', () => {
        this.setState((prevState) => ({
          showEditForm: true,
          onSubmitModal: this.onSaveItem,
          line_item: row
        }))
      }),
      quantity_takeoff: row => this.generateAction('Quantity take off', () => {
        // let rn = row.code;
        // let quantity = this.props.selectedDbItem.properties.Volume
        this.props.quantityTakeOffItem()
      })
    }

  }

  getNextCode = (code) => {

    if(code != '-'){
      let levels = code.split('.')
      let pos = levels.length - 1;
      levels[pos] = (parseInt(levels[pos]) + 1).toString().padStart(2,'0')
      code = levels.join('.')
    }else{
      return code
    }

    
  }

  componentDidMount = () => {
    ReactModal.setAppElement('body');
  }

  getParent = () => {
    return document.querySelector('#EstimateRoute');
  }

  generateAction(title, action){
    return {
      title,
      onClick: () => {
        action()
        this.setState((prevState) => ({
          row_actions_modal: {
            visible: false
          }
        }))
      }
    }
  }

  handleCloseModal = () => {
    this.setState( () => ({
      showEditForm: false
    }) );
  }

  onContextMenu(actions){
    return (e, handleOriginal) => {
      e.preventDefault();
      let xpos = e.pageX
      let ypos = e.pageY

      this.setState((prevState) => ({
        row_actions_modal: {
          visible: true,
          x: xpos,
          y: ypos - this.header_height,
          actions: actions
        }
      }))

      if (handleOriginal) {
        handleOriginal()
      }
    }
  }

  getTrProps(state, rowInfo, column){
    let props = {}

    const onHeaderClick = rowInfo => {
      return () => {
        let subRows = rowInfo.subRows
        let nestingPath = rowInfo.nestingPath

        //  Check if subrows are undefined it means all levels were not used.

        const calculateExpanted = (subRows) => {
          return subRows.reduce((current, item, index) => {
            let v
            if(item._pivotVal == 'undefined'){
              if(item._subRows.length > 0){
                v = calculateExpanted(item._subRows)
              }else{
                v = {}
              }
            }else{
              v = false
            }

            return {
              ...current,
              [index]: v
            }
          }, {})
        }

        let expanted_based_on_subrows = calculateExpanted(subRows)

        //  Get current value of the row to tell whether is open. 
        //    Expanted = {},
        //    Not Expanded = false

        let current_expanted = this.props.expanded

        let current_value = nestingPath.reduce( (current, item) => {
          current = current[item]

          return current
        }, current_expanted);
        
        let isExpanted = typeof(current_value) == 'object'
        
        let new_value = isExpanted ? false : expanted_based_on_subrows

        let calculated_expanded = nestingPath.reduceRight( (current, item, index) => {

          //  Last Item
          if(index == nestingPath.length - 1)
            return{
              [item]: new_value
            }

          return {
            [item]: current
          }
        }, {})

        this.props.save_expanded(calculated_expanded)

      }
    }

    let {add_item, add_header, add_sub_header, delete_item, edit_item, quantity_takeoff} = this.actions
   if(rowInfo ){
    
     let styles = {}
     let row
     let actions = []
     let className
     let path
     let parent_row
     let last_row
     let parent_id, parent_id2;

     // Check the kind of row. Header level 1, Header level 2 ....
     switch (rowInfo.row._pivotID) {

       case "level_0":
          styles.background = 'rgb(190,190,190)'
          //styles.height = '10px'

          props.onClick = onHeaderClick(rowInfo)
       break;

       case "level_1":
          row = rowInfo.row
          console.log(rowInfo)
          // let line_item_row = {
          //   code: rowInfo.row.level_1
          //   parent_id
          // }
          for (let index = 0; index < state.data.length; index++) {
            const element = state.data[index];

            if(element["level_1"] == row._pivotVal){
              parent_id = element.level_1_parent_id
            }
            
          }
          last_row = rowInfo.row._subRows[rowInfo.row._subRows.length - 1]
          styles.background = 'rgb(215,215,215)'

          row = {
            ...row,
            parent_id
          }

          last_row = {
            ...last_row,
            parent_id
          }

          actions = [
            [add_header(row), add_sub_header(last_row)]
          ]

          props.onClick = onHeaderClick(rowInfo)
       break;

       case "level_2":

          
          if(rowInfo.row._pivotVal == "undefined"){
            styles.height = '0px'
          }
          styles.background = 'rgb(235,235,235)'
          row = rowInfo.row
          
          last_row = row._subRows[row._subRows.length - 1]

          for (let index = 0; index < state.data.length; index++) {
            const element = state.data[index];

            if(element["level_2"] == row._pivotVal){

              parent_id = element.level_2_parent_id
              parent_id2 = element.parent_id
            }
            
          }

          row = {
            ...row,
            parent_id
          }

          last_row = {
            ...last_row,
            parent_id2
          }

          actions = [
            [add_header(row), add_sub_header(last_row)]
          ]

          props.onClick = onHeaderClick(rowInfo)
       break;

       case "level_3":

          if(rowInfo.row._pivotVal == "undefined"){
            styles.height = '0px'
          }

          styles.background = 'rgb(245,245,245)'
          row = rowInfo.subRows[rowInfo.subRows.length - 1]._original
          path = [
            ...rowInfo.nestingPath
          ]
          parent_row = state.resolvedData[path.shift()]
  
          for (var i = 0; i < path.length - 1; i++) {
            parent_row = parent_row._subRows[path[i]]
          }
          
          parent_row = parent_row._subRows[parent_row._subRows.length - 1]


          for (let index = 0; index < state.data.length; index++) {
            const element = state.data[index];

            if(element["level_3"] == parent_row._pivotVal){
              parent_id = element.level_3_parent_id
              parent_id2 = element.parent_id
            }
            
          }

          parent_row = {
            ...parent_row,
            parent_id
          }

          actions = [
            [add_item(row), add_header(parent_row)]
          ]

          props.onClick = onHeaderClick(rowInfo)
       break;

       default:
         // Estimate items
         row = rowInfo.original
         if(row.code == '-'){
          styles.height = '0px'
          styles.overflow = 'hidden'
          
         }else{
          path = [...rowInfo.nestingPath]
          parent_row = state.resolvedData[path.shift()]
          for (var i = 0; i < path.length - 1; i++) {
            parent_row = parent_row._subRows[path[i]]
          }
          last_row = parent_row._subRows[parent_row._subRows.length - 1]._original

          className = `EstimateItemRow ${row.id == this.props.estimate_item_selected ? 'EstimateItemRow--Selected ': ''}`
          actions = [
            [add_item(last_row)],
            [edit_item(row), delete_item(row) , quantity_takeoff(row)]
          ]

          props.onClick = () => {
            // Should call an action to bring the line item details.
            this.props.select_estimate_item(row.id)
          }
         }

         

       break;
     }
     //All rows
     props = {
       ...props,
       className,
       onContextMenu: this.onContextMenu(actions),
       style: {
           ...styles
       }
     }
   }

   return props
   }

  //Handlers

  onSaveItem = (values) =>{
    let levels = values.code.split('.')
    levels.map( (lv, i) => {
      values[`level_${i+1}`] = lv
    })

    this.props.saveLineItem(values)
    this.handleCloseModal()
  }

  onAddItem = (values) =>{
    this.props.addEstimateItem(values)
    this.handleCloseModal()
  }

  transformData = (data) => {
    data = data.map(d => {
      let {structure} = d;

      Object.keys(structure).map(key => {
        d[key] = structure[key].code;
        d[`${key}_description`] = structure[key].description
        d[`${key}_parent_id`] = structure[key].parent_id
      })

      d['level_0'] = '00';
      d['level_0_description'] = 'Estimate'

      return d;

    })

    return data;
  }

  render(){

    const levelDepth = ['level_0', 'level_1', 'level_2', 'level_3']

    const pivotColums = levelDepth.map( pivot => ({
      Header: '',
      accessor: pivot,
      width: 30,
      resizable: false,
      Aggregated: row => false,
      PivotValue: () => (<div></div>),
      pivot: true
    }))
    
    const ur_columns = this.props.is_model_visible ? [
      {
        Header: 'Unit price',
        accessor: 'unit_rate',
        Aggregated: row => false,
        Cell: formatColumn('currency')
      }
    ] : [
      {
        Header: 'UR MXN',
        accessor: 'unit_rate_mxn',
        Aggregated: row => false,
        Cell: formatColumn('currency')
      },{
        Header: 'UR USD',
        accessor: 'unit_rate_usd',
        Aggregated: row => false,
        Cell: formatColumn('currency')
      },{
        Header: 'Unit price',
        accessor: 'unit_rate',
        Aggregated: row => false,
        Cell: formatColumn('currency')
      }
    ]

    return (
      <div>
        <ReactTable
          className={this.props.className}
          loading={this.props.loading}
          data={this.transformData(this.props.data)}
          // resolveData = {data => {
          //  return[
          //       {
          //         code: "01.01.01.01",
          //         description: "SUMINISTRO Y COLOCACION DE BLOCK LIZO DE 20X20X20 40CMS CON CASTILLOS AHOGADOS, ACERO DE REFUERZO No. 4",
          //         id: 22,
          //         indirect_percentage: 0,
          //         is_line_item: true,
          //         level_0: "00",
          //         level_0_description: "Estimate",
          //         level_1: "01",
          //         level_1_description: "ARQUITECTURA",
          //         level_1_parent_id: null,
          //         level_2: "01.01",
          //         level_2_description: "AUDITORIO",
          //         level_2_parent_id: 19,
          //         level_3: "01.01.01",
          //         level_3_description: "MUROS",
          //         level_3_parent_id: 20,
          //         line_item_id: 2,
          //         parent_id: 21,
          //         quantity: 274.65,
          //         total: 232790.59,
          //         unit_rate: 847.59,
          //         unit_rate_mxn: 847.59,
          //         unit_rate_usd: 0,
          //         uom: "m2"
          //       }
          //     ]
           
          // }}
          pivotBy={levelDepth}
          showPagination={false}
          columns={[
            ...pivotColums,
            {
              Header: 'Code',
              accessor: 'code',
              Aggregated: row => {
                let arrayOfLevels = levelDepth
                let level = arrayOfLevels.filter(lv => row.row[lv])[0]
                let level_number = parseInt ( level[level.length - 1] , 10)
                let length = levelDepth.length -1
                let rn;
                let original = row.subRows[0];

                for (let index = 0; index < length - level_number ; index++) {
                  original = original._subRows[0]
                }

                rn = original._original[level]

                return (
                  <span>
                    {rn}
                  </span>
                );
              }
            },{
              Header: 'Description',
              accessor: 'description',
              Cell: formatColumn('text'),
              minWidth: 600,
              Aggregated: row => {

                let arrayOfLevels = levelDepth
                let level = arrayOfLevels.filter(lv => row.row[lv])[0]
                let level_number = parseInt ( level[level.length - 1] , 10)
                let length = levelDepth.length -1
                let description;

                let original = row.subRows[0];

                for (let index = 0; index < length - level_number ; index++) {
                  original = original._subRows[0]
                }

                description = original._original[`level_${level_number}_description`]

                return (
                  <span>
                    {description}
                  </span>
                );
              }
            },{
              Header: 'UOM',
              accessor: 'uom',
              Aggregated: row => false
            },{
              Header: 'Quantity',
              accessor: 'quantity',
              Aggregated: row => false,
              Cell: row => <QuantityInput 
                            quantityValue={parseFloat(row.value)}
                            onBlur={quantity => {
                              this.props.save_line_item(row.original.id, {quantity})
                            }}
                            /> //formatColumn('number')
            },
            ...ur_columns
            ,{
              Header: 'Total',
              accessor: 'total',
              aggregate: vals => _.sum(vals),
              Cell: formatColumn('currency')
            }
          ]}
          getTrProps={this.getTrProps.bind(this)}
          onExpandedChange={(expanded, index, event) => {
            // this.props.save_expanded(expanded)
            // this.setState({ expanded })
          }}
          expanded={this.props.expanded}
        />
        {
          this.state.row_actions_modal.visible &&

          <RowActionsModal
            x={this.state.row_actions_modal.x}
            y={this.state.row_actions_modal.y}
            makeInvisible={() => this.setState((prevState) => ({
                row_actions_modal: {
                  visible: false
                }
              }))
            }
           actions={this.state.row_actions_modal.actions}

          />
        }

        <ReactModal
          className="Modal_form_wrapper"
          isOpen={this.state.showEditForm}
          onRequestClose={this.handleCloseModal}
          contentLabel="Edit line item"
          parentSelector={this.getParent}
          closeTimeoutMS={200}
        >
          <ModalForm
            is_item={this.state.is_item}
            line_item={this.state.line_item}
            onSubmit={this.state.onSubmitModal}
            onSubmitText="Save"
          />
        </ReactModal>


      </div>
    )
  }
}

EstimateTable.propTypes = {
  data: PropTypes.array.isRequired,
  expanded: PropTypes.object.isRequired,
  deleteEstimateItem: PropTypes.func.isRequired,
  addEstimateItem: PropTypes.func.isRequired,
  save_line_item: PropTypes.func.isRequired,
  save_expanded: PropTypes.func.isRequired
}

export default EstimateTable
