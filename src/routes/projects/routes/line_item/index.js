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
  loadLineItems 
} from "actions/line_item";

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
    this.props.loadLineItems(this.getProjectId())
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

        let code = parseInt(rootElements.slice(-1)[0].code)
        
        if(code < 99){
            this.props.addLineItem({
              project_id: props.active_project,
              is_item: 0,
              parent_id: null,
              wbs_item_id: null,
              code: (code + 1).toString(),
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

                let itemsToBeDeleted = [
                  item_selected.id,
                  ...getChildren(item_selected._children)
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

  render(){
    const {props} = this
    const table_rows = props.line_items

    //  Toolbar items

    let toolbar_items = this.getToolbarItems()

    return (
      <ReflexContainer
        orientation="horizontal"
      >

        <ReflexElement size={30}>
          <Toolbar 
            items={toolbar_items}
          />
        </ReflexElement> 

        <ReflexElement className="left-pane">
          <ReflexContainer 
              orientation="vertical"
              windowResizeAware={true} 
            >
              <ReflexElement>
                <Table 
                  appElement="#app"
                  loaderAvatar="/images/loader.gif"
                  allowToDragRows={true}
                  selected_rows={this.state.line_items_selected}
                  isLoading={props.is_loading}
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

              <ReflexElement>
                <ImportItemWindow/>
                
              </ReflexElement>
            </ReflexContainer> 

        </ReflexElement>
        
      </ReflexContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  addLineItem: line_item => dispatch(addLineItem(line_item)),
  deleteLineItem: line_item => dispatch(deleteLineItem(line_item)),
  updateLineItem: line_item => dispatch(updateLineItem(line_item)),
  loadLineItems: project_id => dispatch(loadLineItems(project_id))
})

const mapStateToProps = (state) => ({ 
  active_project: state.projects.active,
  line_items: state.line_items.entities,
  is_loading: state.line_items.isFetching 
})

export default connect(mapStateToProps, mapDispatchToProps)(LineItem);