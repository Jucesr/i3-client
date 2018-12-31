import React from 'react'
import PropTypes from 'prop-types'

const Toolbar = (props) => {
  return (
    <div>
      {props.items.map(item => 
        <button key={item.name} onClick={item.action}>
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