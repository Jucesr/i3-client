import React from 'react'
import PropTypes from 'prop-types'

class QuantityInput extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      quantityValue: this.props.quantityValue,
      prevQuantity: this.props.quantityValue
    }
  }

  onChange(e){
    let quantityValue = e.target.value
    if (quantityValue.match(/^\d*(\.\d{0,5})?$/)) {
      this.setState(() => ({ quantityValue }));
    }
  }

  onBlur(e){
    let finalQuantity = e.target.value
    if(finalQuantity.length == 0){
      finalQuantity = 0
      this.setState(() => ({ quantityValue: 0 }))
    }

    if(finalQuantity != this.state.prevQuantity){
      //  Only update the Quantity if it has changed.
      this.setState(() => ({ prevQuantity: finalQuantity }))
      this.props.onBlur(finalQuantity)
    }
    
  }

  render(){

    return (
      <input
        className="QuantityInput"
        type='text'
        value={this.state.quantityValue}
        onChange={this.onChange.bind(this)}
        onBlur={this.onBlur.bind(this)}
      />
    )
  };
}

QuantityInput.propTypes = {
  quantityValue: PropTypes.number.isRequired,
  onBlur: PropTypes.func.isRequired
}

export default QuantityInput
