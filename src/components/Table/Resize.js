import React from 'react'

export default class Resize extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      left_div: {
        current: 100,
        base: 100
      },
      right_div: 150,
      x: 0
    }

    
  }

  onExpanderDraggin = (e) =>{
    //e.preventDefault();
    let xpos = e.pageX
    let ypos = e.pageY

    if(xpos != 0) {
      let grow  = this.state.x - xpos

    let left_div = this.state.left_div.base + (grow * -1) 

    this.setState(prevState => ({
      left_div: {
        ...prevState.left_div,
        current: left_div
      }
    }))
    }
  
  }

  onExpanderEnd = (e) =>{
    let xpos = e.pageX
    let ypos = e.pageY

    let grow  = this.state.x - xpos
    
    let left_div = this.state.left_div.base + (grow * -1) 
    
    this.setState(prevState => ({
      left_div: {
        ...prevState.left_div,
        base: left_div
      }
    }))
  }

  onExpanderStart = (e) =>{
    //e.preventDefault();
    let xpos = e.pageX

    this.setState(prevState => ({
      x: xpos
    }))
  }

  render(){
    const {props, state} = this
    return (
      <div style={{
        display: 'flex'
      }}>
        <div style={{
          width: `${state.left_div.current}px`,
          backgroundColor: 'red',
          position: 'relative',
          display: 'flex'
        }}>
          <div>
            Parte Izquierda
          </div>

          <div 
            onDrag={this.onExpanderDraggin}
            onDragEnd={this.onExpanderEnd}
            //onMouseEnter={this.onExpanderStart}
            onDragStart={this.onExpanderStart}
            style={{
              position: 'absolute',
              top: '0',
              right: '-15px',
              bottom: '0',
              zIndex: 10,
              width: '36px',
              display: 'inline-block',
              // backgroundColor: 'yellow',
              cursor:'col-resize'
            }}>
          </div>
          
        </div>


        


        <div style={{
          width: `${state.right_div}px`,
          backgroundColor: 'blue'
        }}>
          Parte Derecha
        </div>
      </div>
    )
  }
}