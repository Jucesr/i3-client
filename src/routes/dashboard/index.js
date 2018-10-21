import React from 'react'

export default class DashboardRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    const {props} = this
    return (
      <div> This is the dashboard </div>
    )
  }
}