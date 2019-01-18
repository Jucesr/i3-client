import React from 'react'
import PropTypes from 'prop-types'

const Toolbar = (props) => {

  const buttonStyle1 = {
    border: '1px solid rgb(200,200,200)',
    background: 'rgb(240,240,240)',
    padding: '5px 10px'
  }

  const buttonStyle = {
    border: '1px solid rgb(200,200,200)',
    borderLeft: 'none',
    background: 'rgb(240,240,240)',
    padding: '5px 10px'
  }

  return (
    <div>
      {props.items.map((item, index) => 
        <button style={index == 0 ? buttonStyle1 : buttonStyle} key={item.name} onClick={item.action}>
          {item.name}
        </button>
      )
    }
    </div>
  )
}

Toolbar.propTypes = {

}

export default Toolbar