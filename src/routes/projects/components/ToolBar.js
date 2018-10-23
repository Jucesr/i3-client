import React from 'react'
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types'

const ToolBar = (props) => {

  const {isOpen = true} = props

  const toolBarClass = `ToolBar ${isOpen ? 'ToolBar_open' : 'ToolBar_close'}`;

  
  return (
    <div className={toolBarClass}>
        <div className="ToolBar-container">
          <ToolBarItem to="/projects" name="Overview" />
          <ToolBarItem to="/projects/estimates" name="Estimates" />
          <ToolBarItem name="Line Items" />
          <ToolBarItem name="Materials" />
          <ToolBarItem name="WBS" />
          <ToolBarItem name="Packages" />
          <ToolBarItem name="Gallery" />
          <ToolBarItem name="Change orders" />
          <ToolBarItem name="Issues" />
          <ToolBarItem name="Construction Systems" />
        </div>
      </div>
  )
}

ToolBar.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

const ToolBarItem = (props) => {
  return (
    <NavLink
      exact
      to={props.to || '/projects'} 
      className="ToolBar-item"
      activeClassName="ToolBar-item-active"
    > 
      <div>
        {props.name} 
      </div>
  
    </NavLink>
  )
}

export default ToolBar

