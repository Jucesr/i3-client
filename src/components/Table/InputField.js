import React from 'react'
import PropTypes from 'prop-types'

import Textarea from 'react-textarea-autosize';

class InputField extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      currentValue: this.props.value,
      previousValue: this.props.value
    }
  }

  onChange(e){
    let newValue = e.target.value
    let valid = false
    const format = this.props.format
    const type = typeof format === 'string' ? format : format.type
    const decimals = typeof format === 'string' ? 2 : format.decimals


    switch (type) {
      case "text":
        valid = true
      break;

      case "number":
        const re = new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);
        valid = newValue.match(re)
      break;

      default: valid = true
    }

    if(valid){
      this.setState(() => ({ currentValue: newValue }));
    }

    
  }

  onBlur(e){
    let finalValue = e.target.value
    if(finalValue.length === 0){
      finalValue = 0
      this.setState(() => ({ quantityValue: 0 }))
    }

    if(finalValue !== this.state.previousValue){
      //  Only update the value if it has changed.
      this.setState(() => ({ previousValue: finalValue }))
      this.props.onUpdate(finalValue)
    }
    
  }

  render(){

    const type = typeof this.props.format === 'string' ? this.props.format : this.props.format.type
      
    switch (type) {
      case "textarea":
        return (
          <Textarea
            className="InputField"
            style={{
              resize: 'none',
              padding: 0
            }}
            type='text'
            value={this.state.currentValue}
            onChange={this.onChange.bind(this)}
            onBlur={this.onBlur.bind(this)}
          />
        )

      case "number": {
        return (
          <input
            className="InputField"
            type='text'
            value={this.state.currentValue}
            onChange={this.onChange.bind(this)}
            onBlur={this.onBlur.bind(this)}
          />
        )
      }

      case "text": {
        return (
          <input
            className="InputField"
            type='text'
            value={this.state.currentValue}
            onChange={this.onChange.bind(this)}
            onBlur={this.onBlur.bind(this)}
          />
        )
      }
        
      
    }  
  };
}

InputField.propTypes = {
  value: PropTypes.any.isRequired,
  //onBlur: PropTypes.func.isRequired
}

InputField.defaultProps = {
  format: 'text'
};

export default InputField
