import React from 'react'
import {connect} from 'react-redux'

import { loadLineItems } from "actions/line_item";

import Table from "components/Table/Table"

class LineItem extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount = () => {
    this.props.loadLineItems(this.getProjectId())
  }

  getProjectId = () => {
    const url_parts = this.props.location.pathname.split('/');
    const project_id = url_parts[2] 

    return project_id
  }

  render(){
    const {props} = this
    const table_rows = props.line_items
    return (
      <div> 
        <Table 
          appElement="#app"
          loaderAvatar="/images/loader.gif"
          isLoading={props.is_loading}
          noRowsMessage="No line items loaded"
          columns={[{
            Header: 'Code',
            assesor: 'code',
            width: 100
          },{
            Header: 'Spanish Description',
            assesor: 'spanish_description',
            filter: true,
            editable: true,
            format: 'textarea',
            width: 500
          },{
            Header: 'English Description',
            assesor: 'english_description',
            editable: true,
            format: 'textarea',
            width: 500
          },{
            Header: 'UOM',
            assesor: 'uom',
            onlyItems: true,
            width: 100,
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
          }]}
          rows={table_rows}
        /> 
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  loadLineItems: project_id => dispatch(loadLineItems(project_id))
})

const mapStateToProps = (state) => ({ 
  line_items: state.line_items.entities,
  is_loading: state.line_items.isFetching 
})

export default connect(mapStateToProps, mapDispatchToProps)(LineItem);