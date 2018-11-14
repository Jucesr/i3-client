import React from 'react'
import {connect} from 'react-redux';
import {Decimal} from 'decimal.js';
import EstimateTable from "./components/EstimateTable";
import EstimateDetailTable from "./components/EstimateDetailTable";
import EstimateCard from "./components/EstimateCard";
import Viewer from "./components/Viewer";

import { loadEstimates, selectEstimate } from "actions/estimates";

import { 
  loadEstimateItems, 
  addEstimateItem,
  deleteEstimateItem, 
  selectEstimateItem, 
  updateEstimateItemById 
} from "actions/estimate_items";

import { loadLineItemDetailsById, updateLineItemDetailById } from "actions/line_item";

import { saveExpanded } from "actions/ui";

class EstimateRoute extends React.Component {

  constructor(props){
    super(props)

  }

  componentDidMount = () => {
    //  Fetch estimates of the active project.
    this.props.loadEstimates(this.props.projects.active)

    //  If there is an estimate selected it should fetch its estimate items
    if(this.props.estimates.active){
      this.props.loadEstimateItems(this.props.estimates.active)
    }
  }

  onSelectEstimate = (estimate_id) =>{
    this.props.selectEstimate(estimate_id)

    this.props.loadEstimateItems(estimate_id)
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
            description: item.description
          }
    
          return current
        }, {})
    
        estimate_item.structure = structure_object

        //  Get Line item.
        let id = estimate_item.line_item_id

        let line_item = this.props.line_items.items[id]

        
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
      is_line_item: true,
      is_disable: false,
      hierachy_level: 1,
      indirect_percentage: 0,
      project_id: this.props.active_project.id,
      estimate_id: this.props.estimates.active
    }

    this.props.addEstimateItem(estimate_item)
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

    const estimates = props.estimates.items  

    let active_project = props.active_project

    //  Check if the estimates of the active projects have been loaded then take them from estimate collection.

    let estimateCardsArray = active_project.estimates ? props.active_project.estimates.map( id => estimates[id] ) : []
    
    //  Check if an estimate has already been selected then take it from estimate collection.

    const active_estimate = props.estimates.active ? estimates[props.estimates.active] : undefined 

    let estimate_items = active_estimate ? (active_estimate.estimate_items ? active_estimate.estimate_items : []) : []

    estimate_items = this.estimateItemConnector(estimate_items)

    //  Line item details

    let EI_ID = props.estimate_items.active ? props.estimate_items.active : undefined

    let EI = EI_ID ? props.estimate_items.items[EI_ID] : undefined
    
    let LI = EI ? props.line_items.items[EI.line_item_id] : undefined

    let LIDs = LI ? (LI.line_item_details ? LI.line_item_details : []) : []

    LIDs = LIDs.map(lid => ({...lid, line_item_id: LI.id}))

    //  Classname

    const estimate_table_classname = props.is_estimate_detail_visible ? 'EstimateTable' : 'EstimateTable--Full'
    const model_viewer_classname = props.is_estimate_detail_visible ? 'Viewer-container' : 'Viewer-container--Full'

    return (
      <div id="EstimateRoute" className="EstimateRoute">
        {
          active_estimate ? (
            <div className = "EstimateRoute-Active"> 
            
              <div className="EstimateRoute-EstimateTable">
                <EstimateTable
                  className={estimate_table_classname}
                  data={estimate_items}
                  expanded={props.estimates.expanded}
                  save_expanded={props.saveExpanded}
                  deleteEstimateItem={this.onDeleteEstimateItem}
                  addEstimateItem={this.onAddEstimateItem}
                  save_line_item={props.updateEstimateItemById}
                  select_estimate_item = {this.onSelectEstimateItem}
                  estimate_item_selected = {EI_ID}
                  is_model_visible = {props.is_model_visible}
                /> 
                {props.is_model_visible && <Viewer className={model_viewer_classname}/>}
              </div>
              { props.is_estimate_detail_visible && 
              
              <EstimateDetailTable
                data={LIDs}
                save_line_item_detail={props.updateLineItemDetailById}
              />
              
              }  
            </div> 
            

          ) : 
            estimateCardsArray.length > 0 && estimateCardsArray.map(item => {

              if(item){
                return (
                  <EstimateCard
                    onCardClick={() => this.onSelectEstimate(item.id)}
                    key={item.id}
                    name={item.name}
                    code={item.code}
                    description={item.description}
                    currency={item.currency}
                  />
                )
              }
              
            })
          
        }

      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  //  Estimate 

  loadEstimates: id => dispatch(loadEstimates(id)),
  selectEstimate: id => dispatch(selectEstimate(id)),

  //  Estimate Items

  loadEstimateItems: estimate_id => dispatch(loadEstimateItems(estimate_id)),
  addEstimateItem: item => dispatch(addEstimateItem(item)),
  deleteEstimateItem : estimate_id => dispatch(deleteEstimateItem(estimate_id)),
  selectEstimateItem: id => dispatch(selectEstimateItem(id)),
  updateEstimateItemById: (id, item) => dispatch(updateEstimateItemById(id, item)),

  //  Line Item

  loadLineItemById: id => dispatch(loadLineItemById(id)),

  //  Line item details

  loadLineItemDetailsById: id => dispatch(loadLineItemDetailsById(id)),
  updateLineItemDetailById: (ids, item) => dispatch(updateLineItemDetailById(ids, item)),

  //  UI

  saveExpanded: expanded => dispatch(saveExpanded(expanded)),
  

  
})

const mapStateToProps = (state) => ({  
  projects: state.projects,
  estimates: state.estimates,
  estimate_items: state.estimate_items,
  line_items: state.line_items,
  line_item_details: state.line_item_details,
  active_project: state.projects.items[state.projects.active],
  is_model_visible: state.ui.is_model_visible,
  is_estimate_detail_visible: state.ui.is_estimate_detail_visible
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
