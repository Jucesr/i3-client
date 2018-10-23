import React from 'react'
import {connect} from 'react-redux';
import EstimateTable from "./components/EstimateTable";
import EstimateCard from "./components/EstimateCard";
import { loadEstimates, selectEstimate, clearEstimate, saveExpanded } from "actions/estimates";

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
    // this.props.history.push(`/projects/`)   
  }

  onClearEstimate = () =>{

    this.props.clearEstimate()
    
  }

  render(){

    const data = [{
      _id: '001',
      reference_number: '01.01',
      level_1: '01',
      level_1_description: 'Requerimientos generales',
      description: 'Diseno',
      unit_price: 1000.00,
      quantity: 20.00,
      total: 1000.00
    },{
      _id: '002',
      reference_number: '01.02',
      level_1: '01',
      level_1_description: 'Requerimientos generales',
      description: 'Licencias',
      unit_price: 1500.00,
      quantity: 2,
      total: 3000.00
    },{
      _id: '003',
      reference_number: '03.02.01',
      level_1: '03',
      level_1_description: 'Concretos',
      level_2: '02',
      level_2_description: 'Cimentaciones',
      description: 'Excavacion a maquina',
      unit_price: 109.82,
      quantity: 200.45,
      total: 22012.74
    },{
      _id: '004',
      reference_number: '03.02.02',
      level_1: '03',
      level_1_description: 'Concretos',
      level_2: '02',
      level_2_description: 'Cimentaciones',
      description: 'Afine manual',
      unit_price: 40.54,
      quantity: 713.71,
      total: 28933.80
    },{
      _id: '005',
      reference_number: '03.03.01',
      level_1: '03',
      level_1_description: 'Concretos',
      level_2: '03',
      level_2_description: 'Firmes',
      description: 'Plantilla de concreto',
      unit_price: 129.16,
      quantity: 200.4,
      total: 25888.49
    },{
      _id: '006',
      reference_number: '04.01.01',
      level_1: '04',
      level_1_description: 'Albañileria',
      level_2: '01',
      level_2_description: 'Muros',
      description: 'Muro de 8"',
      unit_price: 129.16,
      quantity: 200.4,
      total: 25888.49
    }]

    const {props} = this
    
    const estimateItems = props.estimates.items

    //  Take only the estimates of the active project

    let estimateArray = props.active_project.estimates.map( id => estimateItems[id] )

    return (
      <div className="EstimateRoute">
        {
          props.estimates.active ? (
            <div>
              {/* <EstimateTable 
                data={data}
                expanded={props.estimates.expanded}
                save_expanded={props.saveExpanded}
                delete_line_item={() => {}}
                add_line_item={() => {}}
                save_line_item={() => {}}
              /> */}
              <button onClick={this.onClearEstimate}>Chose another</button>

            </div>
            

          ) : 
            estimateArray.length > 0 && estimateArray.map(item => {

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
  saveExpanded: expanded => dispatch(saveExpanded(expanded))
})

const mapStateToProps = (state) => ({  
  estimates: state.estimates,
  active_project: state.projects.items[state.projects.active]
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
