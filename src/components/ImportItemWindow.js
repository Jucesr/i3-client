import React from 'react'
import {connect} from 'react-redux'
import Table from "components/Table/Table.js";
import Select from 'react-select'

import { 
  loadProjects,
  loadMaterials,
  loadLineItems
 } from "actions/import_window";

class ImportItemWindow extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      fetchingData: false,
      multiType: !props.hasOwnProperty('type'),
      select: {
        project: undefined,
        type: props.hasOwnProperty('type') ? props.type : undefined
      },
      styles: {
        inputWidth: 0,
        labelWidth: 120,
        buttonWidth: 70
      }
    }

    this.container = React.createRef();
  }

  componentDidMount = () => {
    this.props.loadProjects()

    window.addEventListener("resize", () => {
      this.setState(prevState => ({
        styles: {
          ...prevState.styles,
          inputWidth: this.container.current.offsetWidth
        }
      }))
    });

    this.setState(prevState => ({
      styles: {
        ...prevState.styles,
        inputWidth: this.container.current.offsetWidth
      }
    }))
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(prevState.styles.inputWidth != this.container.current.offsetWidth){
      this.setState(prevState => ({
        styles: {
          ...prevState.styles,
          inputWidth: this.container.current.offsetWidth
        }
      }))
    }
    
  }

  shouldComponentUpdate = (nextProps, nextState) => {
  
    if(nextState.select.project != this.state.select.project)
      return false

    return true
  }

  canDropRow = (props, monitor) => {
    return false 
  }

  onLoadButtonClick = e => {

    let type

    if(this.state.select.project && this.state.select.type ){
      if(this.state.multiType){
        //  Get the selected type
        type = this.state.select.type
      }else{
        //  Get the default type
        type = this.props.type
      }
  
      switch (type) {
        case "materials":
          this.props.loadMaterials(this.state.select.project)
        break;
  
        case "line_items":
          this.props.loadLineItems(this.state.select.project)
        break;
      }
    }
  }

  getItems = () => {
    let type

    if(this.state.select.project && this.state.select.type ){
      if(this.state.multiType){
        //  Get the selected type
        type = this.state.select.type
      }else{
        //  Get the default type
        type = this.props.type
      }
  
      switch (type) {
        case "materials":
          return this.props.materials
        
        case "line_items":
          return this.props.line_items
      }
    }

    return {}
  }

  getColumns = () => {
    const select = this.state.select
    let type

    if(select.hasOwnProperty('project') && select.hasOwnProperty('type')){
      if(this.state.multiType){
        //  Get the selected type
        type = select.type
      }else{
        //  Get the default type
        type = this.props.type
      }
  
      switch (type) {
        case "materials":
          return [{
            Header: 'Code',
            assesor: 'code',
            width: 100
          },{
            Header: 'Description',
            assesor: 'description',
            width: 400
          },{
            Header: 'UOM',
            assesor: 'uom',
            onlyItems: true,
            width: 100,
          },{
            Header: 'Unit Rate',
            assesor: 'unit_rate',
            onlyItems: true,
            format: 'currency'
          },{
            Header: 'Currency',
            onlyItems: true,
            assesor: 'currency'
          }]
        
        case "line_items":
          return [{
            Header: 'Code',
            assesor: 'code',
            width: 70
          },{
            Header: 'Spanish Description',
            assesor: 'spanish_description',
            filter: true,
            editable: true,
            format: 'textarea',
            width: 300
          },{
            Header: 'English Description',
            assesor: 'english_description',
            editable: true,
            format: 'textarea',
            width: 300
          },{
            Header: 'UOM',
            assesor: 'uom',
            onlyItems: true,
            editable: true,
            width: 70,
          },{
            Header: 'MXN',
            assesor: 'unit_rate_mxn',
            onlyItems: true,
            format: 'currency'
          },{
            Header: 'USD',
            assesor: 'unit_rate_usd',
            onlyItems: true,
            format: 'currency'
          }]
      }
    }

    return []
  }

  render(){
    const {
      isFetching,
      projects,
      onRowClick,
      onDropRow
    } = this.props

    const options = Object.keys(projects).map(key => {
      const project = projects[key]
      return { value: project.id, label: project.name } 
    })

    const paddingAndMargin = 10 + 20 + 20 + 18

    const selectWidth = this.state.styles.inputWidth - this.state.styles.labelWidth - this.state.styles.buttonWidth - paddingAndMargin

    const customStyles = {
      input: () => ({
        width: selectWidth,
      })
    }

    const formItemStyle = {
      display: 'flex',
      flexDirection: 'row',
      margin: '10px',
      
    }

    const formItemLabelStyle = {
      marginRight: '10px',
      minWidth: `${this.state.styles.labelWidth}px`
    }

    const formButtonStyle = {
      width: `${this.state.styles.buttonWidth}px`,
      height: '100%'
    }

    return (
      <div ref={this.container} >
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          margin: '10px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={formItemStyle}>
              <span style={formItemLabelStyle} >Select a project </span>
              <Select onChange={option => {
                this.setState(prevState => ({
                  select: {
                    ...prevState.select,
                    project: option.value
                  }
                }))
              }} styles={customStyles} options={options}/>
            </div>
            
            {this.state.multiType && <div style={formItemStyle}>
              <span style={formItemLabelStyle}>Select a type </span>
                <Select 
                  defaultValue='materials' 
                  styles={customStyles} 
                  options={[{
                      value: 'materials',
                      label: 'Materials'
                    },{
                      value: 'line_items',
                      label: 'Line Items'
                    }]}
                  onChange={option => {
                    this.setState(prevState => ({
                      select: {
                        ...prevState.select,
                        type: option.value
                      }
                    }))
                  }}
                  />
              </div>}
          </div>

        <div>
          <button onClick={this.onLoadButtonClick} style={formButtonStyle}> Load </button>
        </div>          
      </div>
        
        

        <Table
          onRowClick={onRowClick} 
          allowToDragRows={true}
          canDropRow={this.canDropRow}
          onMoveRow={onDropRow}
          appElement="#app"
          loaderAvatar="/images/loader.gif"
          isLoading={isFetching}
          columns={this.getColumns()}
          rows={this.getItems()}
        /> 
      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => ({
  loadProjects: () => dispatch(loadProjects()),
  loadMaterials: project_id => dispatch(loadMaterials(project_id)),
  loadLineItems: project_id => dispatch(loadLineItems(project_id))
})

const mapStateToProps = (state) => ({  
  materials: state.import_window.materials,
  line_items: state.import_window.line_items,
  projects: state.import_window.projects,
  isFetching: state.import_window.isFetching
})

export default connect(mapStateToProps, mapDispatchToProps)(ImportItemWindow);