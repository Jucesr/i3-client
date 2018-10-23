import React from 'react'

class QuantityInput extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      quantityValue: this.props.quantityValue
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
    this.props.onBlur(finalQuantity)
  }

  render(){

    return (
      <input
        type='text'
        value={this.state.quantityValue}
        onChange={this.onChange.bind(this)}
        onBlur={this.onBlur.bind(this)}
      />
    )
  };
}

export default QuantityInput
