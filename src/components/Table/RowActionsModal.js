import React from 'react'
import "./RowActionsModal.css";

class RowActionsModal extends React.Component {

  componentDidMount(){
     this.menu.focus();
  }

  render(){
    let props = this.props
    return (
      <div
          ref={(menu) => { this.menu = menu }}
          style={{
            top: `${props.y}px`,
            left: `${props.x}px`,
            position: 'absolute',
            background: 'rgb(255, 255, 255)',
            border: 'solid 1px rgb(180, 180, 180)',
            outline: 'none',
            zIndex: '5'
          }}
          onBlur={(e) => {
            props.makeInvisible()
          }}
          tabIndex="0"
        >
        <div className="RowActionsModal_container">

          {props.actions.map((actionGroup, index) => (
            <ul key={index}>
              {actionGroup.map((action, index) => (
                <li key={index} onClick={action.onClick}>{action.title}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    )
  };
}

export default RowActionsModal
