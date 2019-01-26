import React from 'react'
import {connect} from 'react-redux'

import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

import { 
  addLineItem,
  deleteLineItem, 
  updateLineItem,
  loadLineItems,
  importLineItem 
} from "actions/line_item";

import { 
  addSubHeaderTools, 
  clearSubHeaderTools 
} from "actions/ui";

import Table from "components/Table/Table"
import ImportItemWindow from "components/ImportItemWindow";
import Toolbar from "components/Toolbar";

class LineItem extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      line_items_selected: [],
    }
  }

  componentDidMount = () => {

    //  Load tools for this route
    this.props.addSubHeaderTools(['ToggleImportWindow', 'ToggleEstimateDetails'])

    this.props.loadLineItems(this.getProjectId())
  }

  componentWillUnmount = () => {
    //  Remove any tool load by this route
    this.props.clearSubHeaderTools()
  }

  getProjectId = () => {
    const url_parts = this.props.location.pathname.split('/');
    const project_id = url_parts[2] 

    return project_id
  }

  onLineItemRowUpdate = (column, row, value) => {
    this.props.updateLineItem({
      id: row.id,
      [column.assesor]: value
    })
  }

  onLineItemRowSelected = rows => {
    let EI = rows.length == 1 ? this.props.line_items[rows[0]] : null;
    // let is_item = EI !== null ? (EI.is_item) : false 

    // if(is_item){
    //   this.props.loadLineItemDetails(EI.line_item_id)
    // }
    this.setState(prevState => ({
      line_items_selected: rows
    }))
  }

  getToolbarItems = () => {

    const {props, state} = this

    const getChildren = (children) => {

      return children.reduce((acum, child_id) => {
        let new_children = []
        let child = props.line_items[child_id]
        if(child.hasOwnProperty('_children')){
          new_children = getChildren(child._children)
        }

        return [
          ...acum,
          ...new_children,
          child_id
        ]
      }, [])
      
    }

    let toolbar_items = [{
      name: 'Add root element',
      action: () => {

        let rootElements = Object.keys(props.line_items).reduce((acum, key) => {
          if(props.line_items[key].parent_id == null){
            return [
              ...acum,
              props.line_items[key]
            ]
          }
          return acum
        }, [])

        rootElements = rootElements.sort((a,b) => a.code - b.code)

        let code = rootElements.length > 0 ? parseInt(rootElements.slice(-1)[0].code) : 0
        
        if(code < 99){
            this.props.addLineItem({
              project_id: props.active_project,
              is_item: 0,
              parent_id: null,
              wbs_item_id: null,
              code: (code + 1).toString().padStart(2, '0'),
              spanish_description: " ",
              english_description: " ",
              uom: null
          })
        }

      }
    }]

    if(state.line_items_selected.length > 0){
      if(state.line_items_selected.length == 1){
        //  Get the row selected from the props.
        let item_selected = props.line_items[state.line_items_selected[0]]

        if(item_selected.is_item){
          //  Item
          toolbar_items = [
            ...toolbar_items,
            {
              name: 'Delete item',
              action: () => {
  
                this.setState(prevState => ({
                  line_items_selected: []
                }))
  
                this.props.deleteLineItem(item_selected)
              }
            },{
              name: 'Add detail',
              action: () => {
                //  It creates a LID.
                this.toggleCommoditiesWindow()
              }
            }
          ]
        }else{
          //  Header
          toolbar_items = [
            ...toolbar_items,
            {
              name: 'Delete header',
              action: () => {
                //  It needs to delete the header and all sub items/headers

                let children = item_selected.hasOwnProperty('_children') ? getChildren(item_selected._children) : []

                let itemsToBeDeleted = [
                  item_selected.id,
                  ...children
                ]
                
                this.setState(prevState => ({
                  line_items_selected: []
                }))
                itemsToBeDeleted.forEach(id => this.props.deleteLineItem({
                  id: id
                }))
              }
            }
          ]

          if(item_selected.hasOwnProperty('_children') && item_selected._children.length > 0){
            //  Check the kind of children it has, it could be items or headers
            let child = props.line_items[item_selected._children[0]]
            if(child.is_item){
              //  It has items
              toolbar_items = [
                ...toolbar_items,
                {
                  name: 'Add item',
                  action: async () => {

                    let me = props.line_items[item_selected.id]
                    
                    let children = me._children.map(child => props.line_items[child])
            
                    children = children.sort((a,b) => a.code - b.code)
            
                    let code = parseInt(children.slice(-1)[0].code)

                    this.props.addLineItem({
                      project_id: props.active_project,
                      is_item: 1,
                      parent_id: item_selected.id,
                      wbs_item_id: null,
                      code: `${item_selected.code}.${code}`,
                      spanish_description: " ",
                      english_description: " ",
                      uom: null
                    })
                  }
                }
              ]
            }else{
              //  It has more headers
              toolbar_items = [
                ...toolbar_items,
                {
                  name: 'Add header',
                  action: () => {
                    let me = props.line_items[item_selected.id]
                    
                    let children = me._children.map(child => props.line_items[child])
            
                    children = children.sort((a,b) => a.code - b.code)
            
                    let code = parseInt(children.slice(-1)[0].code)

                    this.props.addLineItem({

                      project_id: props.active_project,
                      is_item: 0,
                      parent_id: item_selected.id,
                      wbs_item_id: null,
                      code: `${item_selected.code}.${code}`,
                      spanish_description: " ",
                      english_description: " ",
                      uom: null
                    })
                  }
                }
              ]
            }
            
          }else{
            //  It's empty, free to add items of sub-headers
            toolbar_items = [
              ...toolbar_items,
              {
                name: 'Add item',
                action: () => {

                  this.props.addLineItem({
                    project_id: props.active_project,
                    is_item: 1,
                    parent_id: item_selected.id,
                    wbs_item_id: null,
                    code: `${item_selected.code}.01`,
                    spanish_description: " ",
                    english_description: " ",
                    uom: null
                  })
                }
              },
              {
                name: 'Add header',
                action: () => {
                  this.props.addLineItem({
                    project_id: props.active_project,
                    is_item: 0,
                    parent_id: item_selected.id,
                    wbs_item_id: null,
                    code: `${item_selected.code}.01`,
                    spanish_description: " ",
                    english_description: " ",
                    uom: null
                  })
                }
              }
            ]
          }
          
        }
      }else{
        //  More than 1 row selected
        toolbar_items.push({
          name: 'Delete items',
          action: () => {
            let itemsToBeDeleted = state.line_items_selected

            itemsToBeDeleted = itemsToBeDeleted.reduce((acum, item_id) => {
              let children = []
              let item = props.line_items[item_id]
              if(item.hasOwnProperty('_children')){
                children = getChildren(item._children)
              }

              return [
                item_id,
                ...acum,
                ...children
              ]
            }, [])

            this.setState(prevState => ({
              line_items_selected: []
            }))

            itemsToBeDeleted.forEach(id => this.props.deleteLineItem({
              id: id
            }))
          }
        })
      }
    }

    return toolbar_items
  }


  //  DRAG AND DROP HANLDERS

  canDropRowModule = (props, monitor) => {

    const {row} = props
    const row_being_drag = monitor.getItem().row

    if(row_being_drag.is_item){
      //  It's a line item
      if(row.is_item){
        return true
      }else{
        //  Check if it has children
        if(row.hasOwnProperty('_children') && row._children.length > 0){
          let child = this.props.line_items[row._children[0]]
          
          return child.is_item
            
        }else{
          return true
        //  Empty it does not have children
        }
      } 
     }else{
      //  It's a header.
      if(!row.is_item){
         //  Check if it has children
         if(row.hasOwnProperty('_children') && row._children.length > 0){
          let child = this.props.line_items[row._children[0]]
          
          return !child.is_item
            
        }else{
          return true
        //  Empty it does not have children
        }
      }
      
      return false
      }
  }

  onMoveRowFromImportToModule = (source, target) => {

    this.props.importLineItem(this.getProjectId(), {
      id: source.id,
      parent_id: target.id
    })
  }

  render(){
    const {
      is_detail_visible,
      is_import_window_visible,
      is_loading,
      line_items: table_rows
    } = this.props
    
    //  Toolbar items

    let toolbar_items = this.getToolbarItems()

    return (
      <ReflexContainer
        orientation="vertical"
      >
        {/* Line item Window (Left)*/}
        <ReflexElement>
          <ReflexContainer 
              orientation="horizontal"
          >

          <ReflexElement size={30}>
            <Toolbar 
              items={toolbar_items}
            />
          </ReflexElement>

          <ReflexElement>
            <Table 
              appElement="#app"
              loaderAvatar="/images/loader.gif"
              canDropRow={this.canDropRowModule}
              allowToDragRows={true}
              selected_rows={this.state.line_items_selected}
              isLoading={is_loading}
              noRowsMessage="No line items loaded"
              columns={[{
                Header: 'Code',
                assesor: 'code',
                width: 100
              },{
                Header: 'Spanish Description',
                assesor: 'spanish_description',
                filter: true,
                editable: true,
                format: 'textarea',
                width: 500
              },{
                Header: 'English Description',
                assesor: 'english_description',
                editable: true,
                format: 'textarea',
                width: 500
              },{
                Header: 'UOM',
                assesor: 'uom',
                onlyItems: true,
                editable: true,
                width: 100,
              },{
                Header: 'MXN',
                assesor: 'unit_rate_mxn',
                onlyItems: true,
                format: 'currency'
              },{
                Header: 'USD',
                assesor: 'unit_rate_usd',
                onlyItems: true,
                format: 'currency'
              }]}
              rows={table_rows}
              onRowSelect={this.onLineItemRowSelected}
              onUpdateRow={this.onLineItemRowUpdate}
            /> 
          </ReflexElement>

          <ReflexSplitter/>
          
          {/* Detail Window */}

          { is_detail_visible && 

            <ReflexElement>
              {/* <Modal
                isOpen={this.state.is_commodities_windows_open}
                onRequestClose={this.toggleCommoditiesWindow}
                contentLabel="Example Modal"
              >
                <ImportItemWindow onRowClick={this.onAddLineItemDetail} />
              </Modal> */}

              <Table 
                appElement="#app"
                loaderAvatar="/images/loader.gif"
                isLoading={false}
                noRowsMessage="Select an item to see details here."
                columns={[{
                  Header: 'Type',
                  assesor: 'type',
                  editable: true,
                  format: {
                    type: 'select',
                    options: ['', 'M', 'A']
                  },
                  width: 45,
                },{
                  Header: 'Code',
                  assesor: 'code',
                  editable: true,
                  width: 100
                },{
                  Header: 'Description',
                  assesor: 'description',
                  editable: true,
                  format: 'textarea',
                  width: 700
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
                  width: 150
                },{
                  Header: 'Unit Rate',
                  assesor: 'unit_rate',
                  format: 'currency'
                },{
                  Header: 'Currency',
                  assesor: 'currency'
                },{
                  Header: 'Total',
                  assesor: 'total',
                  format: 'currency' 
                }]}
                rows={[]}
                // selected_rows={this.state.detail_items_selected}
                // onRowExpand={this.onDetailRowExpand}
                // onRowSelect={this.onDetailRowSelected}
                // onUpdateRow={this.onDetailRowUpdate}
              />
            </ReflexElement>

            }

          </ReflexContainer>
        </ReflexElement> 
        
        <ReflexSplitter/>
        
        {/* Import window (Right) */}
        {is_import_window_visible && 
          <ReflexElement 
            className="left-pane"
            propagateDimensions={true} 
            resizeWidth={false}
            resizeHeight={false}
          >
            <ReflexContainer 
                orientation="horizontal"
                windowResizeAware={true} 
              >
                  <ReflexElement
                    propagateDimensions={true} 
                    resizeWidth={false}
                    resizeHeight={false}
                  >
                    <ImportItemWindow
                      onDropRow={this.onMoveRowFromImportToModule}
                      type='line_items'
                    />
                    
                  </ReflexElement>

                  <ReflexSplitter/>

                  {/* Detail Window */}

                  { is_detail_visible && 

                  <ReflexElement>
                    <Table 
                      appElement="#app"
                      loaderAvatar="/images/loader.gif"
                      isLoading={false}
                      noRowsMessage="Select an item to see details here."
                      columns={[{
                        Header: 'Type',
                        assesor: 'type',
                        editable: true,
                        format: {
                          type: 'select',
                          options: ['', 'M', 'A']
                        },
                        width: 45,
                      },{
                        Header: 'Code',
                        assesor: 'code',
                        editable: true,
                        width: 100
                      },{
                        Header: 'Description',
                        assesor: 'description',
                        editable: true,
                        format: 'textarea',
                        width: 700
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
                        width: 150
                      },{
                        Header: 'Unit Rate',
                        assesor: 'unit_rate',
                        format: 'currency'
                      },{
                        Header: 'Currency',
                        assesor: 'currency'
                      },{
                        Header: 'Total',
                        assesor: 'total',
                        format: 'currency' 
                      }]}
                      rows={[]}
                      // selected_rows={this.state.detail_items_selected}
                      // onRowExpand={this.onDetailRowExpand}
                      // onRowSelect={this.onDetailRowSelected}
                      // onUpdateRow={this.onDetailRowUpdate}
                    />
                  </ReflexElement>
                  }

              </ReflexContainer> 

          </ReflexElement>
          }
        
      </ReflexContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  addLineItem: line_item => dispatch(addLineItem(line_item)),
  deleteLineItem: line_item => dispatch(deleteLineItem(line_item)),
  updateLineItem: line_item => dispatch(updateLineItem(line_item)),
  loadLineItems: project_id => dispatch(loadLineItems(project_id)),
  importLineItem: (project_id, line_item) => dispatch(importLineItem(project_id, line_item)),

  addSubHeaderTools: tools => dispatch(addSubHeaderTools(tools)),
  clearSubHeaderTools: () => dispatch(clearSubHeaderTools()),
})

const mapStateToProps = (state) => ({ 
  active_project: state.projects.active,
  line_items: state.line_items.entities,
  is_loading: state.line_items.isFetching,
  is_import_window_visible: state.ui.is_import_window_visible,
  is_detail_visible: state.ui.is_estimate_detail_visible
})

export default connect(mapStateToProps, mapDispatchToProps)(LineItem);