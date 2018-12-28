import React from 'react'
import {connect} from 'react-redux';
import {Route, Redirect} from 'react-router-dom';

import ToolBar from "./components/ToolBar";
import SubHeader from "./components/SubHeader";

import { clearEstimate } from "actions/estimates";
import { toggleModel, toggleEstimateDetails } from "actions/ui";
import { unloadMaterials } from "actions/material";

import EstimateRoute from "./routes/estimate";
import EstimateItemRoute from "./routes/estimate_item";
import MaterialRoute from "./routes/material";

class ProjectRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      isToolBarOpen: false
    }
  }

  onClearEstimate = () => {

    const url_parts = this.props.location.pathname.split('/');
    const project_id = url_parts[2]   

    this.props.clearEstimate()
    this.props.history.push(`/projects/${project_id}/estimates`)
  }

  onToggleModel = () => {
    this.props.toggleModel()
  }

  onToogleEstimateDetails = () => {
    this.props.toggleEstimateDetails()
  }

  onMenuClick = () => {
    this.setState((prevState) => ({
      isToolBarOpen: !prevState.isToolBarOpen
    }))
  }

  componentWillUnmount = () => {
    this.props.unloadMaterials()
  }

  render(){
    const {state, props} = this

    const {projects, estimates} = props
    
    const projectName = !!projects.active ? projects.entities[projects.active].name : 'Undefined'

    const estimateName = estimates.active && estimates.entities[estimates.active].name 

    const overView = () => <div></div>

    //  Add actions to sub header tools
    const sub_header_tools = props.sub_header_tools.map(sht => ({
      name: sht,
      action: this[`on${sht}`],
      avatar: `${sht}.png`,
    }))

    //  It a project has been selected and user try to reach this route it will redirect to '/project' route.
    return (
      <React.Fragment>
        {!!projects.active ? (
          <div className="ProjectRoute"> 
          <SubHeader
            tools={sub_header_tools}
            projectName={projectName} 
            estimateName={estimateName}
            onClickMenuHandler = {this.onMenuClick}
          />
          
          <div className="ProjectRoute_container">
            <ToolBar 
              isOpen={state.isToolBarOpen} 
              project_id={projects.active}
            /> 
  
            <div className="ProjectRoute_subroute">
              <Route path="/projects/:id" component={overView} exact={true}/>
              <Route path="/projects/:id/estimates" component={EstimateRoute} exact={true}/>
              <Route path="/projects/:id/estimates/:id" component={EstimateItemRoute} exact={true}/>
              <Route path="/projects/:id/materials/" component={MaterialRoute} exact={true}/>
            </div> 
          </div>
  
          </div>
        ):(
          <Redirect to="/projects" />
        )}
        
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  clearEstimate: () => dispatch(clearEstimate()),
  toggleModel: () => dispatch(toggleModel()),
  toggleEstimateDetails : () => dispatch(toggleEstimateDetails()),
  unloadMaterials: () => dispatch(unloadMaterials())
})

const mapStateToProps = (state) => ({  
  projects: state.projects,
  estimates: state.estimates,
  sub_header_tools: state.ui.sub_header_tools
})


export default connect(mapStateToProps, mapDispatchToProps)(ProjectRoute);
