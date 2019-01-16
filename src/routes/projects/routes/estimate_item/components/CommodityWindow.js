import React from 'react'
import {connect} from 'react-redux'
import Table from "components/Table/Table.js";
import Select from 'react-select'

import { loadMaterials } from "actions/material";
import { loadProjects } from "actions/projects";

class CommodityWindow extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      items: {},
      select: {
        project: 1,
        type: 'materials'
      }
    }
  }

  componentDidMount = () => {
    this.props.loadProjects()
  }

  render(){
    const {props} = this
    const options = Object.keys(this.props.projects).map(key => {
      const project = this.props.projects[key]

      return { value: project.id, label: project.name } 
    })


    const customStyles = {
      input: () => ({
        width: 800,
      })
    }

    return (
      <div >
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          margin: '10px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              margin: '10px'
            }}>
              <span style={{marginRight: '10px'}} >Select a project </span>
              <Select onChange={option => {
                this.setState(prevState => ({
                  select: {
                    ...prevState.select,
                    project: option.value
                  }
                }))
              }} styles={customStyles} options={options}/>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              margin: '10px'
            }}>
              <span style={{marginRight: '10px'}}>Select a type </span>
                <Select defaultValue='materials' styles={customStyles} options={[{
                  value: 'materials',
                  label: 'Materials'
                },{
                  value: 'line_items',
                  label: 'Line Items'
                }]}/>
              </div>
          </div>

        <div style={{width: '10%'}}>
          <button onClick={e => {


            this.props.loadMaterials(this.state.select.project)
          }} style={{width: '100%', height: '100%'}}> Load </button>
        </div>          
      </div>
        
        

        <Table
          onRowClick={this.props.onRowClick} 
          appElement="#app"
          loaderAvatar="/images/loader.gif"
          isLoading={props.is_loading}
          columns={[{
            Header: 'Code',
            assesor: 'code',
            width: 100
          },{
            Header: 'Description',
            assesor: 'description',
            width: 500
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
          }]}
          rows={this.props.materials}
        /> 
      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => ({
  loadProjects: () => dispatch(loadProjects()),
  loadMaterials: project_id => dispatch(loadMaterials(project_id))
})

const mapStateToProps = (state) => ({  
  materials: state.materials.entities,
  projects: state.projects.entities
})

export default connect(mapStateToProps, mapDispatchToProps)(CommodityWindow);