import React from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types'

import { toggleSideBar, toggleModel, toggleEstimateDetails } from "actions/ui";

const SubHeader = (props) => {

  const {projects, estimates} = props
    
  const projectName = !!projects.active ? projects.entities[projects.active].name : 'Undefined'

  const moduleName = props.moduleName

  const estimateName = estimates.active && estimates.entities[estimates.active].name 

  //  Add actions to sub header tools
  const sub_header_tools = props.sub_header_tools.map(sht => ({
    name: sht,
    action: props[`${sht.charAt(0).toLowerCase() + sht.slice(1)}`],
    avatar: `${sht}.png`,
  }))

  
  return (
    <div className="SubHeader">

      <div className="SubHeader-menu" onClick={props.toggleSideBar}>
        <img width="30px" src="/images/menu.png"></img>
      </div>

      <div className="SubHeader-margin">
        
        <div className="SubHeader-project">
          <strong>{projectName}</strong>
        </div>

        <div className="SubHeader-module">
          {moduleName}
        </div>

        <div className="SubHeader-estimate">
          {estimateName}
        </div>

      </div>

      <div className="SubHeader-toolbar">
        {sub_header_tools.map(tool => (
          <ToolItem key={tool.name} action={tool.action}  src={tool.avatar}/>
        ))}
      </div>

    </div>
  )
}

const ToolItem = (props) => {
  
  return (
    <div className="SubHeader-toolbar-item">
      <div onClick={props.action}>
        <img src={`/images/tools/${props.src}`}></img>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  toggleSideBar: () => dispatch(toggleSideBar()),
  toggleModel: () => dispatch(toggleModel()),
  toggleEstimateDetails : () => dispatch(toggleEstimateDetails())
})

const mapStateToProps = (state) => ({  
  projects: state.projects,
  moduleName: state.ui.module_name,
  estimates: state.estimates,
  sub_header_tools: state.ui.sub_header_tools
})

export default connect(mapStateToProps, mapDispatchToProps)(SubHeader);

