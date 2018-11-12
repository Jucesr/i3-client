import React from 'react'
import {connect} from 'react-redux';
import {Decimal} from 'decimal.js';
import EstimateTable from "./components/EstimateTable";
import EstimateDetailTable from "./components/EstimateDetailTable";
import EstimateCard from "./components/EstimateCard";
import Viewer from "./components/Viewer";

import { loadEstimates, selectEstimate, saveExpanded } from "actions/estimates";

import { selectEstimateItem, updateEstimateItemById } from "actions/estimate_items";

import { loadLineItemDetailsById, updateLineItemDetailById } from "actions/line_item";

class EstimateRoute extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      is_model_visible: false
    }
  }

  componentDidMount = () => {
    this.props.loadEstimates()

    //  Load tools for estimate
    console.log('I am mounted')
  }

  onSelectEstimate = (id) =>{
    this.props.selectEstimate(id)
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

    this.props.loadLineItemDetailsById(EI.line_item_id)

  }

  render(){

    const {props, state} = this

    const estimateCards = props.estimates.items

    const selectedEstimate = props.estimates.active ? estimateCards[props.estimates.active] : undefined 

    const estimateData = selectedEstimate ? this.estimateItemConnector(selectedEstimate.items) : []

    //  Take only the estimates of the active project

    let estimateCardsArray = props.active_project.estimates.map( id => estimateCards[id] )

    //  Line item details

    let EI_ID = props.estimate_items.active ? props.estimate_items.active : undefined

    let EI = EI_ID ? props.estimate_items.items[EI_ID] : undefined
    
    let LI = EI ? props.line_items.items[EI.line_item_id] : undefined

    let LIDs = LI ? (LI.line_item_details ? LI.line_item_details : []) : []

    LIDs = LIDs.map(lid => ({...lid, line_item_id: LI.id}))

    return (
      <div id="EstimateRoute" className="EstimateRoute">
        {
          selectedEstimate ? (
            <div style={{width:"100%"}}>
              <div className="EstimateRoute-EstimateTable">
                <EstimateTable
                  data={estimateData}
                  expanded={props.estimates.expanded}
                  save_expanded={props.saveExpanded}
                  delete_line_item={() => {}}
                  add_line_item={() => {}}
                  save_line_item={props.updateEstimateItemById}
                  select_estimate_item = {this.onSelectEstimateItem}
                  estimate_item_selected = {EI_ID}
                /> 
                {state.is_model_visible && <Viewer/>}
              </div>
              <div>
                <EstimateDetailTable
                  data={LIDs}
                  save_line_item_detail={props.updateLineItemDetailById}
                />  
              </div>
              
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
  loadEstimates: () => dispatch(loadEstimates()),
  loadLineItemDetailsById: id => dispatch(loadLineItemDetailsById(id)),
  updateLineItemDetailById: (ids, item) => dispatch(updateLineItemDetailById(ids, item)),
  selectEstimate: id => dispatch(selectEstimate(id)),
  selectEstimateItem: id => dispatch(selectEstimateItem(id)),
  updateEstimateItemById: (id, item) => dispatch(updateEstimateItemById(id, item)),
  saveExpanded: expanded => dispatch(saveExpanded(expanded)),
  loadLineItemById: id => dispatch(loadLineItemById(id))
})

const mapStateToProps = (state) => ({  
  estimates: state.estimates,
  estimate_items: state.estimate_items,
  line_items: state.line_items,
  line_item_details: state.line_item_details,
  active_project: state.projects.items[state.projects.active]
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
