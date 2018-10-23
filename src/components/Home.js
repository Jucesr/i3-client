import React from 'react'

export default class HomeRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    const {props} = this
    return (
      <div className="HomePage">
          <img src="/images/logo.png"></img>
      </div>
    )
  }
}