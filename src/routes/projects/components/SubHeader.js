import React from 'react'
import PropTypes from 'prop-types'

const SubHeader = (props) => {
  const {
    projectName,
    estimateName,
    onClickMenuHandler
  } = props
  return (
    <div className="SubHeader-wrapper">
      <div className="SubHeader">
        <div onClick={onClickMenuHandler}>
          <img width="30px" src="/images/menu.png"></img>
        </div>
        <div className="SubHeader-project">
          <strong>{projectName}</strong>
        </div>

        <div className="SubHeader-estimate">
          {estimateName}
        </div>
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
