import React from 'react'

export default class HomeRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    const {props} = this
    return (
      <div> Welcome to my app </div>
    )
  }
}