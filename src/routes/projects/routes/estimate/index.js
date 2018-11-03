import React from 'react'
import {connect} from 'react-redux';
import EstimateTable from "./components/EstimateTable";
import EstimateCard from "./components/EstimateCard";


import EstimateTest from "./components/EstimateTest";
import { loadEstimates, selectEstimate, clearEstimate, saveExpanded } from "actions/estimates";
import { loadEstimateItems } from "actions/estimate_items";
import { loadLineItems } from "actions/line_item";

class EstimateRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount = () => {
    this.props.loadEstimates()
  }

  onSelectEstimate = (id) =>{
    this.props.selectEstimate(id)
  }

  onClearEstimate = () => {

    this.props.clearEstimate()
    
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
          estimate_item.uom = line_item.uom
          estimate_item.unit_rate = line_item.unit_rate_mxn + (line_item.unit_rate_usd * 19.5)
          estimate_item.total = estimate_item.unit_rate * estimate_item.quantity
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

  render(){

    const {props} = this

    const estimateCards = props.estimates.items

    const selectedEstimate = props.estimates.active ? estimateCards[props.estimates.active] : undefined 

    const estimateData = selectedEstimate ? this.estimateItemConnector(selectedEstimate.items) : []

    //  Take only the estimates of the active project

    // console.log(estimateData)

    let estimateCardsArray = props.active_project.estimates.map( id => estimateCards[id] )

    return (
      <div id="EstimateRoute" className="EstimateRoute">
        {
          selectedEstimate ? (
            <div style={{width:"100%"}}>
              <EstimateTable 
                data={estimateData}
                expanded={props.estimates.expanded}
                save_expanded={props.saveExpanded}
                delete_line_item={() => {}}
                add_line_item={() => {}}
                save_line_item={() => {}}
              />

              

              {/* <EstimateTest items={estimateData} /> */}
              <button onClick={this.onClearEstimate}>Chose another</button>

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
  selectEstimate: id => dispatch(selectEstimate(id)),
  clearEstimate: () => dispatch(clearEstimate()),
  saveExpanded: expanded => dispatch(saveExpanded(expanded)),
  loadEstimateItems: () => dispatch(loadEstimateItems()),
  loadLineItemById: id => dispatch(loadLineItemById(id)),
  loadLineItems: () => dispatch(loadLineItems())
})

const mapStateToProps = (state) => ({  
  estimates: state.estimates,
  estimate_items: state.estimate_items,
  line_items: state.line_items,
  active_project: state.projects.items[state.projects.active]
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
