import React from 'react'
import {connect} from 'react-redux';
import EstimateCard from "./components/EstimateCard";

import { loadEstimates, selectEstimate } from "actions/estimates";

class EstimateRoute extends React.Component {

  constructor(props){
    super(props)
  }

  getProjectId = () => {
    const url_parts = this.props.location.pathname.split('/');
    const project_id = url_parts[2] 

    return project_id
  }

  componentDidMount = () => {
    //  Fetch estimates of the active project.
    this.props.loadEstimates(this.getProjectId())
  }

  onSelectEstimate = (estimate_id) =>{
    this.props.selectEstimate(estimate_id)

    this.props.history.push(`/projects/${this.getProjectId()}/estimates/${estimate_id}`)
  }

  render(){

    const {props, state} = this

    const estimates = props.estimates.entities  


    const active_project = props.projects.entities[this.getProjectId()] 

    //  Check if the estimates of the active projects have been loaded then take them from estimate collection.

    let estimateCardsArray = active_project.estimates ? active_project.estimates.map( id => estimates[id] ) : []
    
    return (
      <div id="EstimateRoute" className="EstimateRoute">
        {
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
  selectEstimate: id => dispatch(selectEstimate(id))
})

const mapStateToProps = (state) => ({  
  projects: state.projects,
  estimates: state.estimates
})

export default connect(mapStateToProps, mapDispatchToProps)(EstimateRoute);
