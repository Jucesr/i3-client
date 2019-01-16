import React from 'react'
import {connect} from 'react-redux'

import { loadMaterials } from "actions/material";

import Table from "components/Table/Table"

class Material extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount = () => {
    this.props.loadMaterials(this.getProjectId())
  }

  getProjectId = () => {
    const url_parts = this.props.location.pathname.split('/');
    const project_id = url_parts[2] 

    return project_id
  }

  render(){
    const {props} = this
    const table_rows = props.materials
    return (
      <div> 
        <Table 
          appElement="#app"
          loaderAvatar="/images/loader.gif"
          isLoading={props.is_loading}
          noRowsMessage="Select an estimate item to see details here."
          columns={[{
            Header: 'Code',
            assesor: 'code',
            width: 100
          },{
            Header: 'Description',
            assesor: 'description',
            editable: true,
            format: 'textarea',
            width: 700
          },{
            Header: 'UOM',
            assesor: 'uom',
            onlyItems: true,
            width: 100,
          },{
            Header: 'Base Cost',
            assesor: 'base_cost',
            editable: true,
            onlyItems: true,
            format: 'currency'
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
          rows={table_rows}
        /> 
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  loadMaterials: project_id => dispatch(loadMaterials(project_id))
})

const mapStateToProps = (state) => ({ 
  materials: state.materials.entities,
  is_loading: state.materials.isFetching 
})

export default connect(mapStateToProps, mapDispatchToProps)(Material);