import React from 'react'
import PropTypes from 'prop-types'

const SubHeader = (props) => {
  const {
    projectName,
    estimateName,
    onClickMenuHandler,
    clearEstimate,
    toggleModel,
    toggleEstimateDetails
  } = props
  
  return (
    <div className="SubHeader">

      <div className="SubHeader-menu" onClick={onClickMenuHandler}>
        <img width="30px" src="/images/menu.png"></img>
      </div>

      <div className="SubHeader-margin">
        
        <div className="SubHeader-project">
          <strong>{projectName}</strong>
        </div>

        <div className="SubHeader-estimate">
          {estimateName}
        </div>

      </div>

      <div className="SubHeader-toolbar">
        <ToolItem action={clearEstimate}  src="calculator.png"/>
        <ToolItem action={toggleEstimateDetails} src="edit.png"/>
        <ToolItem action={toggleModel} src="cubes.png"/>
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

SubHeader.propTypes = {
  projectName: PropTypes.string,
  estimateName: PropTypes.string,
  onClickMenuHandler: PropTypes.func
}

export default SubHeader
