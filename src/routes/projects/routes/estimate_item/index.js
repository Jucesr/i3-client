import React from 'react'
import {connect} from 'react-redux';
import {Decimal} from 'decimal.js';
import Viewer from "./components/Viewer";
import Toolbar from "components/Toolbar";
import ImportItemWindow from "components/ImportItemWindow";
import Modal from 'react-modal'

import 'react-reflex/styles.css'

import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

import Table from "components/Table/Table";

import { clearEstimate } from "actions/estimates";

import { 
  loadEstimateItems, 
  addEstimateItem,
  deleteEstimateItem, 
  updateEstimateItem 
} from "actions/estimate_items";

import { 
  addLineItem,
  addLineItemDetail,
  loadLineItemDetails, 
  updateLineItemDetail 
} from "actions/line_item";

import { 
  loadMaterialByCode,
  copyMaterialToOtherProject
 } from "actions/material";

import { addSubHeaderTools, clearSubHeaderTools } from "actions/ui";

class EstimateRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      line_item_details: {},
      estimate_items_selected: [],
      detail_items_selected: [],
      is_commodities_windows_open: false,
      windows_width: 1920
    }

    this.container = React.createRef();
  }

  getEstimateId = () => {
    const url_parts = this.props.location.pathname.split('/');
    const estimate_id = url_parts[4] 

    return estimate_id
  }

  componentDidMount = () => {
    
    //  Load tools for this route
    this.props.addSubHeaderTools(['ToggleModel', 'ToggleEstimateDetails'])

    //  Load estimate items
    this.props.loadEstimateItems(this.getEstimateId())

  }

  componentWillUnmount = () => {
    //  Remove any tool load by this route
    this.props.clearSubHeaderTools()
    this.props.clearEstimate()
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    // Object.entries(this.props).forEach(([key, val]) =>
    //   nextProps[key] !== val && console.log(`Prop '${key}' changed`)
    // );

    //  Do not render if it has not finished to load all the line items.
    if(nextProps.line_items !== this.props.line_items && nextProps.isLoadingEstimateItems){
      return false
    }

    return true
  }

  onEstimateRowSelected = rows => {
    let EI = rows.length == 1 ? this.props.estimate.estimate_items[rows[0]] : null;
    let is_item = EI !== null ? (EI.is_item) : false 

    if(is_item){
      this.props.loadLineItemDetails(EI.line_item_id)
    }

    this.setState(prevState => ({
      estimate_items_selected: rows
    }))
  }

  onEstimateRowUpdate = (column, row, value) => {
    this.props.updateEstimateItem({
      id: row.id,
      estimate_id: this.getEstimateId(),
      [column.assesor]: value
    })
  }

  onEstimateRowExpand = (row) => {
    if(row.is_item){
      this.props.loadLineItemDetails(row.line_item_id)
    }
  }

  onDetailRowExpand = (row) => {
    if(row.is_assembly){
      this.props.loadLineItemDetails(row.entity_id)
    }
  }

  onDetailRowUpdate = (column, row, value) => {
    if(column.assesor == 'quantity'){
      let quantity = parseFloat(value)
      this.props.updateLineItemDetail(row.parent_id, {
        id: row.id,
        quantity
      })
    }
  }

  onDetailRowSelected = rows => {
    this.setState(prevState => ({
      detail_items_selected: rows
    }))
  }

  toggleCommoditiesWindow = () => {
    this.setState(prevState => ({
      is_commodities_windows_open: !this.state.is_commodities_windows_open
    }))
  }

  onAddEstimateItem = item => {
    //  Add meta data.
    const estimate_item = {
      ...item,
      wbs_item_id: null,
      line_item_id: item.hasOwnProperty('line_item_id') ? item.line_item_id : null,
      is_disable: false,
      hierachy_level: 1,
      indirect_percentage: 0,
      project_id: this.props.active_project.id,
      estimate_id: this.props.estimate.id
    }

    return this.props.addEstimateItem(estimate_item)
  }

  onDeleteEstimateItem = item => {
    //  Add meta data.

    const estimate_item = {
      ...item,
      estimate_id: this.props.estimate.id
    }

    this.props.deleteEstimateItem(estimate_item)
  }

  onAddLineItemDetail = async row => {
    
    let lid = {
      project_id: row.project_id,
      is_assembly: false,
      quantity: 0,
      formula: ""
    }
    //  Only allow to add Materials that are items.
    if(row.is_item){  

      //  Check if the material that is being added is from other project.
      if(row.project_id !== this.props.active_project.id){
        //  It will need to check if the material with the code already exists in the current project.
        const response = await this.props.loadMaterialByCode(this.props.active_project.id, row.code)
        
        if(response.hasOwnProperty('error')){
          //  It does not exits
          //  It will need to make a copy of the material. (Create it in the current project).
          let material = {
            ...row,
            base_cost: row.unit_rate,
            other_cost: row.unit_rate,
            waste_cost: row.unit_rate,
            project_id: this.props.active_project.id
          }
          
          const new_material = await this.props.copyMaterialToOtherProject(material.id, this.props.active_project.id)
          
          if(!new_material.hasOwnProperty('error')){
            const new_detail = new_material.response  

            lid = {
              ...lid,
              id: new_detail.id,
              code: new_detail.code
            }
          }

        }else{
          //  It exits
          
          const current_material = response.response

          //  It needs to check if the unit rate matches
          if(current_material.unit_rate == row.unit_rate){
            //  There is no problem
          }else{
            //  Unit rates are different
          }

          lid = {
            ...lid,
            id: current_material.id,
            code: current_material.code
          }
        }
    
      }else{

        //  Belongs to the same project, There is no need to validate anything
        lid = {
          ...lid,
          id: row.id,
          code: row.code
        }
      }
      

      const line_item_id = this.props.estimate.estimate_items[this.state.estimate_items_selected[0]].line_item_id

      this.props.addLineItemDetail(line_item_id, lid)
      this.toggleCommoditiesWindow()
      
    }
    
  }


  prepareLIDs = (LIDs, parent_id, parent_line_item_id) => {
    
    return LIDs.reduce((acum, lid) => {
      let _children = {} 
      if(lid.is_assembly){
      //  It is a line item. It should fetch it from the state if its already load.
        let line_item = this.props.line_items[lid.entity_id]
        lid = {
          ...lid,
          code: line_item.code,
          unit_rate_mxn: line_item.unit_rate_mxn,
          unit_rate_usd: line_item.unit_rate_usd,
          description: line_item.spanish_description,
          currency: "MXN", // TODO: This has to be the currency of the project
          uom: line_item.uom
        }

        //  Check if the line item has already loaded its detail.
        if(line_item.hasOwnProperty('line_item_details')){
          _children = this.prepareLIDs(line_item.line_item_details, lid.id, lid.entity_id)
          
          lid = {
            ...lid,
            _children: line_item.line_item_details.map(li => li.id)
          }
        }

      }else{
      //  It is a material.
        let material = this.props.materials[lid.entity_id]
        lid = {
          ...lid,
          code: material.code,
          unit_rate_mxn: material.currency == 'MXN' ? material.unit_rate : 0,
          unit_rate_usd: material.currency == 'USD' ? material.unit_rate : 0,
          description: material.description,
          currency: material.currency,
          uom: material.uom, 
        }
      }

      return {
        ...acum,
        ..._children,
        [lid.id]: {
          ...lid,
          parent_line_item_id: parent_line_item_id,
          parent_id: parent_id,
          is_item: !lid.is_assembly,
          code: lid.code,
          unit_rate: lid.unit_rate_mxn + (lid.unit_rate_usd * 20),
          total: (lid.unit_rate_mxn + (lid.unit_rate_usd * 20)) * lid.quantity,
          type: lid.is_assembly ? 'A': 'M'
          }
      }
    }, {})
  }

  calculateTotals = (rows) => {

    const getTotal = (children => {
      return children.reduce((acum, id) => {
        let row = rows[id]
        
        if(row.hasOwnProperty('_children')){
          return acum + getTotal(row._children)
        }
        return acum + !isNaN(row.total) ? row.total: 0
        
      }, 0)

    })

    return Object.keys(rows).reduce((acum, key) => {
      let row = rows[key]
      //  Check if it is a header and have subrows, it means it needs to go deeper
      if(row.hasOwnProperty('_children') && !row.is_item){
        row.total = getTotal(row._children)
      }
        
      return {
        ...acum,
        [key]: row
      }

    }, {})

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

    if(state.estimate_items_selected.length > 0){
      if(state.estimate_items_selected.length == 1){
        //  Get the row selected from the props.
        let ei_selected = props.estimate.estimate_items[state.estimate_items_selected[0]]

        if(ei_selected.is_item){
          //  Item
          toolbar_items = [
            ...toolbar_items,
            {
              name: 'Delete item',
              action: () => {
  
                this.setState(prevState => ({
                  estimate_items_selected: []
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
                    let child = props.estimate.estimate_items[child_id]
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
                  estimate_items_selected: []
                }))
                itemsToBeDeleted.forEach(id => this.onDeleteEstimateItem({
                  id: id
                }))
              }
            }
          ]

          if(ei_selected.hasOwnProperty('_children') && ei_selected._children.length > 0){
            //  Check the kind of children it has, it could be items or headers
            let child = props.estimate.estimate_items[ei_selected._children[0]]
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
            let itemsToBeDeleted = state.estimate_items_selected

            this.setState(prevState => ({
              estimate_items_selected: []
            }))
            itemsToBeDeleted.forEach(id => this.onDeleteEstimateItem({
              id: id
            }))
          }
        })
      }
    }


    if(state.detail_items_selected.length > 0){

    }

    return toolbar_items
  }

  render(){

    const {props, state} = this
 
    //  Check if an estimate has already been selected then take it from estimate collection.

    const active_estimate = props.estimate

    let estimate_items = active_estimate ? (active_estimate.estimate_items ? active_estimate.estimate_items : {}) : {}

    Object.keys(estimate_items).forEach(key => {
      let estimate_item = estimate_items[key] 
      if(estimate_item.is_item && !!estimate_item.line_item_id){
        let line_item = props.line_items[estimate_item.line_item_id]
        estimate_items[key] = {
          ...estimate_item,
          uom: line_item.uom,
          unit_rate_mxn: line_item.unit_rate_mxn,
          unit_rate_usd: line_item.unit_rate_usd,
          total: (line_item.unit_rate_mxn + (line_item.unit_rate_usd * 20)) * estimate_item.quantity
        }
      }
    })

    estimate_items = this.calculateTotals(estimate_items)
    
    //  Line item details
    //  It checks if an estimate item has been selected. If it is it will take the details of the line item that belongs to the estimate item

    let table_detail_rows = {}

    if(state.estimate_items_selected.length == 1){

      let EI_ID = state.estimate_items_selected[0] 

      let EI = props.estimate.estimate_items[EI_ID]

      if(EI.is_item){
        let LI = props.line_items[EI.line_item_id] 

        const LIDs = LI.line_item_details ? LI.line_item_details : []

        //  Prepare line item details for table component. Add value false to the prop is_item if it is an assembly
        table_detail_rows = this.prepareLIDs(LIDs, null, EI.line_item_id) 
      }
      
        
    }

    //  Toolbar items

    let toolbar_items = this.getToolbarItems()

    //  Styles
    const model_viewer_classname = props.is_estimate_detail_visible ? 'Viewer-container' : 'Viewer-container--Full'
    
    return (
      <ReflexContainer
        className="EstimateItemRoute"
        windowResizeAware={true} 
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
                  selected_rows={this.state.estimate_items_selected}
                  isLoading={estimate_items.length == 0}
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
                    editable: true,
                    onlyItems: true,
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
                    Header: 'UR MXN',
                    assesor: 'unit_rate_mxn',
                    format: 'currency'
                  },{
                    Header: 'UR USD',
                    assesor: 'unit_rate_usd',
                    format: 'currency'
                  },{
                    Header: 'Total',
                    assesor: 'total',
                    format: 'currency' 
                  }]}
                  rows={estimate_items}
                  onRowSelect={this.onEstimateRowSelected}
                  onUpdateRow={this.onEstimateRowUpdate}
                />
              
            </ReflexElement>
            <ReflexSplitter/>
            
            {props.is_model_visible && <ReflexElement className="right-pane">
              {/* <div>Aqui va el modelo</div> */}
              <Viewer className={model_viewer_classname}/>
            </ReflexElement>}        

          </ReflexContainer>
              
        </ReflexElement>
        <ReflexSplitter/>       
        { props.is_estimate_detail_visible && 

            <ReflexElement>
              <Modal
                isOpen={this.state.is_commodities_windows_open}
                onRequestClose={this.toggleCommoditiesWindow}
                contentLabel="Example Modal"
              >
                <ImportItemWindow onRowClick={this.onAddLineItemDetail} />
              </Modal>

              <Table 
                appElement="#app"
                loaderAvatar="/images/loader.gif"
                isLoading={props.isLoadingLineItemDetails}
                noRowsMessage="Select an estimate item to see details here."
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
                rows={table_detail_rows}
                selected_rows={this.state.detail_items_selected}
                onRowExpand={this.onDetailRowExpand}
                onRowSelect={this.onDetailRowSelected}
                onUpdateRow={this.onDetailRowUpdate}
              />
            </ReflexElement>
        
        }
            
      </ReflexContainer>
      
    )
  }
}

const mapDispatchToProps = (dispatch) => ({

  clearEstimate: () => dispatch(clearEstimate()),

  //  Estimate Items

  loadEstimateItems: estimate_id => dispatch(loadEstimateItems(estimate_id)),
  addEstimateItem: item => dispatch(addEstimateItem(item)),
  deleteEstimateItem : estimate_id => dispatch(deleteEstimateItem(estimate_id)),
  updateEstimateItem: (id, item) => dispatch(updateEstimateItem(id, item)),

  //  Line items
  addLineItem: line_item => dispatch(addLineItem(line_item)),

  //  Line item details

  addLineItemDetail: (line_item_id, lid) => dispatch(addLineItemDetail(line_item_id, lid)),
  loadLineItemDetails: id => dispatch(loadLineItemDetails(id)),
  updateLineItemDetail: (line_item_id, LID) => dispatch(updateLineItemDetail(line_item_id, LID)),

  //  UI

  addSubHeaderTools: tools => dispatch(addSubHeaderTools(tools)),
  clearSubHeaderTools: () => dispatch(clearSubHeaderTools()),

  //  Material
  loadMaterialByCode: ( project_id, code ) => dispatch(loadMaterialByCode(project_id, code)),
  copyMaterialToOtherProject: (material_id, project_id) => dispatch(copyMaterialToOtherProject(material_id, project_id))
})

const mapStateToProps = (state) => ({  
  ui: state.ui,
  estimate: state.estimates.entities[state.estimates.active],
  isLoadingEstimateItems: state.estimates.isFetching,
  isLoadingLineItemDetails: state.line_items.isFetching,
  line_items: state.line_items.entities,
  line_item_details: state.line_item_details,
  materials: state.materials.entities,
  active_project: state.projects.entities[state.projects.active],
  is_model_visible: state.ui.is_model_visible,
  is_estimate_detail_visible: state.ui.is_estimate_detail_visible
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
