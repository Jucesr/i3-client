import React from 'react'
import {connect} from 'react-redux';
import {Decimal} from 'decimal.js';
import EstimateTable from "../estimate_item/components/EstimateTable";
import EstimateDetailTable from "../estimate_item/components/EstimateDetailTable";
import Viewer from "../estimate_item/components/Viewer";

import tree from "utils/Tree";

import Table from "components/Table/Table";

import { 
  loadEstimateItems, 
  addEstimateItem,
  deleteEstimateItem, 
  selectEstimateItem, 
  updateEstimateItemById 
} from "actions/estimate_items";

import { loadLineItemDetailsById, updateLineItemDetailById } from "actions/line_item";

import { addSubHeaderTools, saveExpanded } from "actions/ui";

class EstimateRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      estimate_item_selected: null,
      windows_width: 0
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
    this.props.addSubHeaderTools(['ClearEstimate', 'ToggleModel', 'ToogleEstimateDetails'])
    this.props.loadEstimateItems(this.getEstimateId())

    this.setState(prevState => ({
      windows_width: this.container.current.offsetWidth
    }))

  }

  shouldComponentUpdate = (nextProps, nextState) => {
    // Object.entries(this.props).forEach(([key, val]) =>
    //   nextProps[key] !== val && console.log(`Prop '${key}' changed`)
    // );

    //  Do not render if it has not finished to load al the line items.
    if(nextProps.line_items !== this.props.line_items && nextProps.isLoadingEstimateItems){
      return false
    }

    return true
  }

  parseEstimateItems = (raw) => {

    const getStructure = ( current, parent_id ) => {
      if(parent_id != null){
        let element = raw[parent_id]
        if(!element){
          return current
        }
        current.push(element)
        return getStructure(current, element.parent_id)  
      }else{
        return current
      }
    }

    const new_items = Object.keys(raw).reduce( (current, key) => {
      let estimate_item = raw[key];
    
      //  If it is a line item and not a section
      if(estimate_item && estimate_item.is_line_item == true){
        //  Get the tree structure
       
        let structure = getStructure([], estimate_item.parent_id)
    
        structure = structure.reverse()
    
        let structure_object = structure.reduce((current, item, index) => {

          current[`level_${index + 1}`] = {
            code: item.code,
            description: item.description,
            parent_id: item.parent_id
          }
    
          return current
        }, {})
    
        estimate_item.structure = structure_object

        //  Get Line item.
        let id = estimate_item.line_item_id

        let line_item = this.props.line_items[id]

        
        if(line_item){

          let {unit_rate_mxn, unit_rate_usd} = line_item

          //  Round values to 2 Decimals

          let urm = new Decimal(unit_rate_mxn ? unit_rate_mxn : 0)
          let urd = new Decimal(unit_rate_usd ? unit_rate_usd : 0)

          let unit_rate = parseFloat (urm.plus(urd.times(19.5)).toFixed(2))
          let total = parseFloat( new Decimal(unit_rate).times(estimate_item.quantity).toFixed(2) )
          
          // unit_rate_mxn = Math.round(unit_rate_mxn * 100) / 100
          // unit_rate_usd = Math.round(unit_rate_usd * 100) / 100
          // let unit_rate = unit_rate_mxn + (unit_rate_usd * 19.5)
          // let total = unit_rate * estimate_item.quantity

          // total = Math.round(total * 100) / 100

          estimate_item.uom = line_item.uom
          estimate_item.unit_rate_mxn = parseFloat (urm.toFixed(2)) 
          estimate_item.unit_rate_usd = parseFloat (urd.toFixed(2)) 
          estimate_item.unit_rate = unit_rate
          estimate_item.total = total
        }

        current.push(estimate_item)
      }
      
      return current
    }, [])

    return new_items
  }

  estimateItemConnector = (itemsOfSelectedEstimate) => {
    const estimate_items = this.props.estimate_items.items;
    let keys = Object.keys(estimate_items)

    if(keys.length == 0 || itemsOfSelectedEstimate.length == 0)
      return []

    const itemsOfSelectedEstimateObject = itemsOfSelectedEstimate.reduce( (current, id) => {
      current[id] = estimate_items[id]
      return current;  
    }, {})

    return this.parseEstimateItems(itemsOfSelectedEstimateObject)

    
  }

  onSelectEstimateItem = id => {
    this.props.selectEstimateItem(id)

    let EI = this.props.estimate_items.items[id]

    if(!!EI.line_item_id){
      this.props.loadLineItemDetailsById(EI.line_item_id)
    }
  }

  onAddEstimateItem = item => {
    //  Add meta data.
    const estimate_item = {
      ...item,
      wbs_item_id: null,
      line_item_id: null,
      is_disable: false,
      hierachy_level: 1,
      indirect_percentage: 0,
      project_id: this.props.active_project.id,
      estimate_id: this.props.estimates.active
    }

    return this.props.addEstimateItem(estimate_item)
  }

  onDeleteEstimateItem = item => {
    //  Add meta data.

    const estimate_item = {
      ...item,
      estimate_id: this.props.estimates.active
    }

    this.props.deleteEstimateItem(estimate_item)
  }

  render(){

    const {props, state} = this

    
    //  Check if an estimate has already been selected then take it from estimate collection.

    const active_estimate = props.estimate

    let estimate_items = active_estimate ? (active_estimate.estimate_items ? active_estimate.estimate_items : []) : []

    estimate_items = tree.map(estimate_items, (estimate_item => {
      if(estimate_item.is_line_item && !!estimate_item.line_item_id){
        let line_item = props.line_items[estimate_item.line_item_id]
        estimate_item = {
          ...estimate_item,
          uom: line_item.uom,
          unit_rate_mxn: line_item.unit_rate_mxn,
          unit_rate_usd: line_item.unit_rate_usd,
          total: (line_item.unit_rate_mxn + (line_item.unit_rate_usd * 20)) * estimate_item.quantity
        }
      }
      return estimate_item
    }))

    console.log(estimate_items)

    //  Line item details
    //  It checks if an estimate item has been selected. If it is it will take the details of the line item that belongs to the estimate item

    let EI_ID = state.estimate_item_selected ? state.estimate_item_selected : undefined

    let EI = EI_ID ? estimate_items[EI_ID] : undefined
    
    let LI = EI ? props.line_items[EI.line_item_id] : undefined

    let LIDs = LI ? (LI.line_item_details ? LI.line_item_details : []) : []

    LIDs = LIDs.map(lid => ({...lid, line_item_id: LI.id}))

    //  Styles

    const tableStyle = {
      width: props.is_model_visible ? state.windows_width / 2 : state.windows_width,
      //height: props.is_estimate_detail_visible ? 
    }

    const estimate_table_classname = props.is_estimate_detail_visible ? 'EstimateTable' : 'EstimateTable--Full'
    const model_viewer_classname = props.is_estimate_detail_visible ? 'Viewer-container' : 'Viewer-container--Full'
    
    return (
      <div ref={this.container} id="EstimateRoute" className="EstimateRoute">
        
        <div className = "EstimateRoute-Active"> 
            
              <div className="EstimateRoute-EstimateTable">
                <div 
                  style={tableStyle}
                  className={estimate_table_classname}
                  >
                  <Table
                    
                    appElement="#app"
                    loaderAvatar="/images/loader.gif"
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
                      Header: 'UR_USD',
                      assesor: 'unit_rate_usd',
                      format: 'currency'
                    },{
                      Header: 'Total',
                      assesor: 'total',
                      format: 'currency' 
                    }]}
                    rows={estimate_items}
                  />
                </div>
              
                {props.is_model_visible && <div>Aqui va el modelo</div>}  
                {/* <Viewer className={model_viewer_classname}/> */}
              </div>
              { props.is_estimate_detail_visible && 
              
              <EstimateDetailTable
                data={LIDs}
                save_line_item_detail={props.updateLineItemDetailById}
              />
              }  
            </div>

      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({

  //  Estimate Items

  loadEstimateItems: estimate_id => dispatch(loadEstimateItems(estimate_id)),
  addEstimateItem: item => dispatch(addEstimateItem(item)),
  deleteEstimateItem : estimate_id => dispatch(deleteEstimateItem(estimate_id)),
  selectEstimateItem: id => dispatch(selectEstimateItem(id)),
  updateEstimateItemById: (id, item) => dispatch(updateEstimateItemById(id, item)),

  //  Line item details

  loadLineItemDetailsById: id => dispatch(loadLineItemDetailsById(id)),
  updateLineItemDetailById: (ids, item) => dispatch(updateLineItemDetailById(ids, item)),

  //  UI

  saveExpanded: expanded => dispatch(saveExpanded(expanded)),
  addSubHeaderTools: tools => dispatch(addSubHeaderTools(tools))
  
})

const mapStateToProps = (state) => ({  
  ui: state.ui,
  estimate: state.estimates.entities[state.estimates.active],
  isLoadingEstimateItems: state.estimates.isFetching,
  line_items: state.line_items.entities,
  line_item_details: state.line_item_details,
  active_project: state.projects.items[state.projects.active],
  is_model_visible: state.ui.is_model_visible,
  is_estimate_detail_visible: state.ui.is_estimate_detail_visible
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
