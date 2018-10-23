import React from 'react'
import PropTypes from 'prop-types'

const EstimateCard = (props) => {
  return (
    <div onClick={props.onCardClick}  className="EstimateCard">
      <div className="EstimateCard_margin">
        <div className="EstimateCard_title">
          {/* <img src = "/images/calculator.png"></img> */}
          {props.name}
        </div>
        <div className="EstimateCard_description">
          <div>Code</div>
          <p>{props.code}</p>
        </div>
        <div className="EstimateCard_description">
          <div>Description</div>
          <p>{props.description}</p>
          
        </div>
        <div className="EstimateCard_description">
          <div>Currency</div>
          <p>{props.currency}</p>
        </div>   
      </div>
      
    </div>
  )
}

EstimateCard.propTypes = {
  onCardClick : PropTypes.func,
  name: PropTypes.string,
  code: PropTypes.string,
  description: PropTypes.string,
  currency: PropTypes.string
}

export default EstimateCard