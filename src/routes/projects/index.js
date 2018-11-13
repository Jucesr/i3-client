import React from 'react'
import {connect} from 'react-redux';
import {Route} from 'react-router-dom';

import ToolBar from "./components/ToolBar";
import SubHeader from "./components/SubHeader";

import { clearEstimate } from "actions/estimates";
import { toggleModel, toggleEstimateDetails } from "actions/ui";

import EstimateRoute from "./routes/estimate";

class ProjectRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      isToolBarOpen: false
    }
  }

  render(){
    const {state, props} = this

    const {projects, estimates} = props

    const projectName = !!projects.active ? projects.items[projects.active].name : 'Undefined'

    const estimateName = estimates.active && estimates.items[estimates.active].name 

    const overView = () => <div></div>

    return (
      <div className="ProjectRoute"> 
        <SubHeader
          projectName={projectName} 
          estimateName={estimateName}
          onClickMenuHandler = {e => {
            this.setState((prevState) => ({
              isToolBarOpen: !prevState.isToolBarOpen
            }))
          
          }}
          clearEstimate={props.clearEstimate}
          toggleModel={props.toggleModel}
          toggleEstimateDetails={props.toggleEstimateDetails}
        />
        
        <div className="ProjectRoute_container">
          <ToolBar 
            isOpen={state.isToolBarOpen} 
          /> 

          <div className="ProjectRoute_subroute">
            <Route path="/projects/" component={overView} exact={true}/>
            <Route path="/projects/estimates" component={EstimateRoute} exact={true}/>
          </div> 
        </div>

      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  clearEstimate: () => dispatch(clearEstimate()),
  toggleModel: () => dispatch(toggleModel()),
  toggleEstimateDetails : () => dispatch(toggleEstimateDetails()),
})

const mapStateToProps = (state) => ({  
  projects: state.projects,
  estimates: state.estimates
})


export default connect(mapStateToProps, mapDispatchToProps)(ProjectRoute);
