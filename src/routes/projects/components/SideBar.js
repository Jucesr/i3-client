import React from 'react'
import {connect} from 'react-redux'
import {NavLink} from 'react-router-dom'
import PropTypes from 'prop-types'

import { setModuleName } from "actions/ui"

const SideBar = (props) => {

  const {isOpen = true} = props

  const SideBarClass = `SideBar ${isOpen ? 'SideBar_open' : 'SideBar_close'}`;

  const routes = [{
    name: 'Overview',
    to: ''
  },{
    name: 'Estimates',
    to: '/estimates'
  },{
    name: 'Line Items',
    to: '/line_items'
  },{
    name: 'Materials',
    to: '/materials'
  },{
    name: 'WBS',
  },{
    name: 'Packages',
  },{
    name: 'Gallery',
  },{
    name: 'Change orders',
  },{
    name: 'Issues',
  },{
    name: 'Construction Systems',
  }]

  const id = props.project_id;
  return (
    <div className={SideBarClass}>
        <div className="SideBar-container">
          {routes.map((route, index) => 
            <SideBarItem 
              key={index} 
              className={`SideBar-item ${props.moduleName == route.name ? 'SideBar-item-active': ''}`}
              to={`/projects/${id}${route.to}`} 
              name={route.name}
              onClick={() => {
                props.setModuleName(route.name)
              }}
              />
              
            )
          }
        </div>
      </div>
  )
}

const SideBarItem = (props) => {
  return (
    <NavLink
      exact
      to={props.to || '/projects'} 
      className={props.className}
      onClick={props.onClick}
    > 
      <div>
        {props.name} 
      </div>
  
    </NavLink>
  )
}

const mapDispatchToProps = (dispatch) => ({
  setModuleName: name => dispatch(setModuleName(name)),
})

const mapStateToProps = (state) => ({  
  project_id: state.projects.active,
  moduleName: state.ui.module_name
})

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
