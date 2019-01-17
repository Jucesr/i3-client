import React from 'react'
import {connect} from 'react-redux';
import {Route, Redirect} from 'react-router-dom';

import ToolBar from "./components/ToolBar";
import SubHeader from "./components/SubHeader";

import { selectProject } from "actions/projects";
import { clearEstimate } from "actions/estimates";
import { toggleModel, toggleEstimateDetails } from "actions/ui";
import { unloadMaterials } from "actions/material";
import { unloadLineItems } from "actions/line_item";

import EstimateRoute from "./routes/estimate";
import EstimateItemRoute from "./routes/estimate_item";
import MaterialRoute from "./routes/material";
import LineItemRoute from "./routes/line_item";

class ProjectRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      isToolBarOpen: false
    }
  }

  componentWillUnmount = () => {
    this.props.unloadMaterials()
    this.props.unloadLineItems()
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
              <Route path="/projects/:id/line_items/" component={LineItemRoute} exact={true}/>
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
  selectProject: id => dispatch(selectProject(id)),
  clearEstimate: () => dispatch(clearEstimate()),
  toggleModel: () => dispatch(toggleModel()),
  toggleEstimateDetails : () => dispatch(toggleEstimateDetails()),
  unloadMaterials: () => dispatch(unloadMaterials()),
  unloadLineItems: () => dispatch(unloadLineItems())
})

const mapStateToProps = (state) => ({  
  projects: state.projects,
  estimates: state.estimates,
  sub_header_tools: state.ui.sub_header_tools
})


export default connect(mapStateToProps, mapDispatchToProps)(ProjectRoute);
