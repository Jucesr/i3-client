import React from 'react'
import {connect} from 'react-redux'

import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

import { loadLineItems } from "actions/line_item";

import Table from "components/Table/Table"
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

    let toolbar_items = [{
      name: 'Add root element',
      action: () => {
        this.onAddEstimateItem({
          parent_id: null,
          code: "01",
          description: " ",
          quantity: 0,
          is_item: false
        })
      }
    }]

    if(state.line_items_selected.length > 0){
      if(state.line_items_selected.length == 1){
        //  Get the row selected from the props.
        let ei_selected = props.line_items[state.line_items_selected[0]]

        if(ei_selected.is_item){
          //  Item
          toolbar_items = [
            ...toolbar_items,
            {
              name: 'Delete item',
              action: () => {
  
                this.setState(prevState => ({
                  line_items_selected: []
                }))
  
                this.onDeleteEstimateItem(ei_selected)
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

                let itemsToBeDeleted = [
                  ei_selected.id,
                  ...getChildren(ei_selected._children)
                ]
                
                this.setState(prevState => ({
                  line_items_selected: []
                }))
                itemsToBeDeleted.forEach(id => this.onDeleteEstimateItem({
                  id: id
                }))
              }
            }
          ]

          if(ei_selected.hasOwnProperty('_children') && ei_selected._children.length > 0){
            //  Check the kind of children it has, it could be items or headers
            let child = props.line_items[ei_selected._children[0]]
            if(child.is_item){
              //  It has items
              toolbar_items = [
                ...toolbar_items,
                {
                  name: 'Add item',
                  action: async () => {
                    //  It creates a line item and assign the line item id to the estimate item
                    let line_item = {
                      project_id: this.props.active_project.id,
                      wbs_item_id: null,
                      code: '01',
                      spanish_description: 'Algo',
                      english_description: 'Something',
                      uom: ' '
                    }

                    let {response} = await this.props.addLineItem(line_item)

                    this.onAddEstimateItem({
                      parent_id: ei_selected.id,
                      line_item_id: response.id,
                      code: "01",
                      description: " ",
                      quantity: 0,
                      is_item: true
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
                    this.onAddEstimateItem({
                      parent_id: ei_selected.id,
                      code: "01",
                      description: " ",
                      quantity: 0,
                      is_item: false
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
                action: async () => {

                  let line_item = {
                    project_id: this.props.active_project.id,
                    wbs_item_id: null,
                    code: '01',
                    spanish_description: 'Algo',
                    english_description: 'Something',
                    uom: ' '
                  }

                  let {response} = await this.props.addLineItem(line_item)

                  this.onAddEstimateItem({
                    parent_id: ei_selected.id,
                    line_item_id: response.id,
                    code: "01",
                    description: " ",
                    quantity: 0,
                    is_item: true
                  })
                }
              },
              {
                name: 'Add header',
                action: () => {
                  this.onAddEstimateItem({
                    parent_id: ei_selected.id,
                    code: "01",
                    description: " ",
                    quantity: 0,
                    is_item: false
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

            this.setState(prevState => ({
              line_items_selected: []
            }))
            itemsToBeDeleted.forEach(id => this.onDeleteEstimateItem({
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
                /> 
              </ReflexElement>
            </ReflexContainer> 

        </ReflexElement>
        
      </ReflexContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  loadLineItems: project_id => dispatch(loadLineItems(project_id))
})

const mapStateToProps = (state) => ({ 
  active_project: state.projects.active,
  line_items: state.line_items.entities,
  is_loading: state.line_items.isFetching 
})

export default connect(mapStateToProps, mapDispatchToProps)(LineItem);