import React from 'react'
import ReactTable from "react-table"
import PropTypes from 'prop-types'
import { formatColumn } from "utils";

const DetailTable = (props) => {
  
  const data = props.data.map( element => ({
    ...element,
    type: element.is_assembly ? 'A' : 'M',
    total: element.unit_rate_mxn + (element.unit_rate_usd * 19.5)
  }))
  
  return (
    <div>
      <ReactTable
          className="EstimateDetailTable"
          data={data}
          showPagination={false}
          columns={[
            {
              Header: 'Type',
              accessor: 'type',
              minWidth: 35,
            },{
              Header: 'Code',
              accessor: 'entity_code',
              minWidth: 70,
            },{
              Header: 'Description',
              accessor: 'description',
              Cell: formatColumn('text'),
              minWidth: 400,
            },{
              Header: 'UOM',
              accessor: 'uom',
              minWidth: 70,
            },{
              Header: 'Quantity',
              accessor: 'quantity',
              Cell: formatColumn('number'),
              minWidth: 70,
            },{
              Header: 'UR MXN',
              accessor: 'unit_rate_mxn',
              Cell: formatColumn('currency'),
              minWidth: 70,
            },{
              Header: 'UR USD',
              accessor: 'unit_rate_usd',
              Cell: formatColumn('currency'),
              minWidth: 70,
            },{
              Header: 'Currenncy',
              accessor: 'currency',
              Cell: formatColumn('currency'),
              minWidth: 70,
            },{
              Header: 'Total',
              accessor: 'total',
              Cell: formatColumn('currency'),
              minWidth: 70,
            }
          ]}
          
        />

    </div>
  )
}

DetailTable.propTypes = {

}

export default DetailTable