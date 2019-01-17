import React from 'react'
import {connect} from 'react-redux';
import {Route, Redirect} from 'react-router-dom';

import SideBar from "./components/SideBar";
import SubHeader from "./components/SubHeader";

import { clearModuleName } from "actions/ui";
import { unloadMaterials } from "actions/material";
import { unloadLineItems } from "actions/line_item";

import EstimateRoute from "./routes/estimate";
import EstimateItemRoute from "./routes/estimate_item";
import MaterialRoute from "./routes/material";
import LineItemRoute from "./routes/line_item";

class ProjectRoute extends React.Component {

  constructor(props){
    super(props)
  }

  componentWillUnmount = () => {
    this.props.unloadMaterials()
    this.props.unloadLineItems()
    this.props.clearModuleName()
  }


  render(){
    const {state, props} = this

    const {projects} = props
    
    const overView = () => <div></div>

    //  It a project has been selected and user try to reach this route it will redirect to '/project' route.
    return (
      <React.Fragment>
        {!!projects.active ? (
          <div className="ProjectRoute"> 
          
          <SubHeader/>
          
          <div className="ProjectRoute_container">
            <SideBar /> 
  
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
  clearModuleName: () => dispatch(clearModuleName()),
  unloadMaterials: () => dispatch(unloadMaterials()),
  unloadLineItems: () => dispatch(unloadLineItems())
})

const mapStateToProps = (state) => ({  
  projects: state.projects
})


export default connect(mapStateToProps, mapDispatchToProps)(ProjectRoute);
