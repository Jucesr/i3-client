import React from 'react'
import PropTypes from 'prop-types'
import ReactTable from "react-table"
import ReactModal from 'react-modal';
// import ModalForm from './ModalForm'
import QuantityInput from './QuantityInput'
import RowActionsModal from './RowActionsModal'

import "react-table/react-table.css"

import _ from 'lodash'

Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

class EstimateTable extends React.Component {

  constructor(props){
    super(props);
    this.header_height = 0
    this.state = {
      expanded: this.props.expanded,
      row_actions_modal: {
        visible: false,
        x: 0,
        y: 0,
        actions: []
      },
      line_item: null,
      showEditForm: false,
      onSubmitModal: null
    }
    this.actions = {
      add_item: (row) => this.generateAction('Add line item', () => {
        let {code} = row
        let levels = code.split('.')
        let pos = levels.length - 1;
        levels[pos] = (parseInt(levels[pos]) + 1).toString().padStart(2,'0')
        code = levels.join('.')

        this.setState((prevState) => ({
          showEditForm: true,
          onSubmitModal: this.onAddItem,
          line_item: {code}
        }))
      }),
      add_header: (row) => this.generateAction('Add header', () => {
        console.log('It will add a header')
        console.log(row)
      }),
      add_sub_header: (row) => this.generateAction('Add sub header', () => {
        console.log('It will add a sub header ')
        console.log(row)
      }),
      delete_item: row => this.generateAction('Delete item', () => {
        this.props.deleteLineItem(row._id)
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

    //Binding

    this.handleCloseModal = this.handleCloseModal.bind(this)

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

  formatIndividualColumn(format){
     switch (format) {
       case 'currency':
         return row => {
             return !isNaN(row.value) ? (
               `$${parseFloat(row.value).format(2,3,',','.')}`
             ) : row.value
           }
       break;

       case 'number':
         return row => {
             return !isNaN(row.value) ? (
               `${parseFloat(row.value).format(2,3,',','.')}`
             ) : row.value
           }
       break;

       case 'text': {
         return row => row.value
       }
       break;
       default:

     }
   }

  handleCloseModal() {
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
   let events = {}

   let {add_item, add_header, add_sub_header, delete_item, edit_item, quantity_takeoff} = this.actions
   if(rowInfo ){
     let row
     let color
     let actions = []
     let className
     switch (rowInfo.row._pivotID) {
       case "level_0":
         color = 'rgb(190,190,190)'
       break;
       case "level_1":
         row = rowInfo.row._subRows[rowInfo.row._subRows.length - 1]
         color = 'rgb(215,215,215)'
         actions = [
           [add_item(row), add_header(row), add_sub_header(row)]
         ]
       break;
       case "level_2":
        color = 'rgb(235,235,235)'
       break;
       case "level_3":
        color = 'rgb(245,245,245)'
       break;
       default:
         //Line items
         row = rowInfo.original
         let path = rowInfo.nestingPath
         let parent_row = state.resolvedData[path.shift()]
         for (var i = 0; i < path.length - 1; i++) {
           parent_row = parent_row._subRows[path[i]]
         }
         let last_row = parent_row._subRows[parent_row._subRows.length - 1]._original

         color = 'rgb(245,245,245)'
         className = 'test-hover'
         actions = [
           [add_item(last_row)],
           [edit_item(row), delete_item(row) , quantity_takeoff(row)]
         ]

       break;
     }
     //All rows
     events = {
       className,
       onContextMenu: this.onContextMenu(actions),
       style: {
           background: color
       }
     }
   }

   return events
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
    let levels = values.code.split('.')
    levels = _.reverse(_.tail(_.reverse(levels))) //Remove last element of array
    levels.map( (lv, i) => {
      values[`level_${i+1}`] = lv
    })

    this.props.addLineItem(values)
    this.handleCloseModal()
  }

  transformData = (data) => {
    data = data.map(d => {
      let {structure} = d;

      Object.keys(structure).map(key => {
        d[key] = structure[key].code;
        d[`${key}_description`] = structure[key].description
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

    return (
      <div>
        <ReactTable
          data={this.transformData(this.props.data)}
          pivotBy={levelDepth}
          showPagination={false}
          defaultPageSize={this.props.data.length}
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
              Aggregated: row => {

                let arrayOfLevels = levelDepth
                let level = arrayOfLevels.filter(lv => row.row[lv])[0]
                let level_number = parseInt ( level[level.length - 1] , 10)
                let length = levelDepth.length -1
                let description;

                let original = row.subRows[0];
                
                //  0 -> 2
                //  1 => 1
                //  2 => 0
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
              Header: 'Unit price',
              accessor: 'unit_rate',
              Aggregated: row => false,
              Cell: this.formatIndividualColumn('currency')
            },{
              Header: 'Quantity',
              accessor: 'quantity',
              Aggregated: row => false,
              Cell: this.formatIndividualColumn('number')
            },{
              Header: 'Total',
              accessor: 'total',
              aggregate: vals => _.sum(vals),
              Cell: this.formatIndividualColumn('currency')
            }
          ]}
          className="-striped -highlight"
          getTrProps={this.getTrProps.bind(this)}
          onExpandedChange={expanded => {
            this.props.save_expanded(expanded)
            this.setState({ expanded })
          }}
          expanded={this.state.expanded}
        />
        {/* {
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
        } */}

        {/* <ReactModal
          className="Modal_form_wrapper"
          isOpen={this.state.showEditForm}
          onRequestClose={this.handleCloseModal}
          contentLabel="Edit line item"
          parentSelector={this.getParent}
          closeTimeoutMS={200}
        >
          <ModalForm
            line_item={this.state.line_item}
            onSubmit={this.state.onSubmitModal}
            onSubmitText="Save"
          />
        </ReactModal> */}


      </div>
    )
  }
}

EstimateTable.propTypes = {
  data: PropTypes.array.isRequired,
  expanded: PropTypes.object.isRequired,
  delete_line_item: PropTypes.func.isRequired,
  add_line_item: PropTypes.func.isRequired,
  save_line_item: PropTypes.func.isRequired,
  save_expanded: PropTypes.func.isRequired
}

export default EstimateTable
