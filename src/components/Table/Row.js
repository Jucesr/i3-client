import React from 'react'
import { ItemTypes } from './Constants'
import flow from 'lodash/flow'
import { DragSource, DropTarget } from 'react-dnd'
import InputField from "./InputField"

const RowTarget = {
  drop(props, monitor, component) {
    return {
      drop_row: props.row
    }
  },
  canDrop(props){
    const {row} = props
    return !row.is_item && 
    (
      (row.hasOwnProperty('subrows') && row.subrows.length > 0 && row.subrows[0].is_item) || 
      (row.hasOwnProperty('subrows') && row.subrows.length === 0) ||
      (!row.hasOwnProperty('subrows'))
    )
  }
};

const RowSource = {
    beginDrag(props) {
      return {
        row: props.row
      }
    },
    endDrag(props, monitor) {
      const item = monitor.getItem()
      const dropResult = monitor.getDropResult()

      //  Row cannot be drop inside itself and not inside of the current header
      if (dropResult && item.row.parent_id !== dropResult.drop_row.id && item.row.id !== dropResult.drop_row.id) {
        props.onMoveRow(item.row, dropResult.drop_row)
      }
    }
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

function collectSource(connect, monitor) {
    return{
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging()
    }
}

class Row extends React.Component {

  formatColumn = (format, value) =>{
    
    const type = typeof format === 'string' ? format : format.type
    const decimals = typeof format === 'string' ? 2 : format.decimals

    const transform = function(org, n, x, s, c) {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
          num = org.toFixed(Math.max(0, ~~n));
    
      return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };

    switch (type) {
      case 'currency':
        
        return !isNaN(value) ? (
          `$${transform(parseFloat(value), decimals,3,',','.')}`
        ) : value
          
  
      case 'number':
        
        return !isNaN(value) ? (
          `${transform(parseFloat(value), decimals, 3,',','.')}`
        ) : value
          

      default:
  
    }
  }

  onRowClick = row => {
    return e => {
      e.preventDefault();
      this.props.onRowClick(row) 
    }
  }

  onRowExpand = row => {
    return e => {
      this.props.onRowExpand(row)
    }
  }

  onRowSelect = row => {
    return e => {
      
      this.props.onRowSelect(row, e.ctrlKey)
      
      
    }
  }

  shouldRenderCell = (column, row) => {
    let isValueValid = typeof row[column.assesor] === "number" ? true : (!!row[column.assesor])
    let shouldRender = false
    
    if(column.onlyItems){
      if(row.is_item){
        shouldRender = true
      }else{
        shouldRender = false
      }
    }else{
      shouldRender = true
    }

    return (!!isValueValid && shouldRender)
  }

  onUpdateCellValue = (column, row, value) => {
    this.props.onUpdateRow(column, row, value)
  }

  renderCell = (column, row) => {

    if(this.shouldRenderCell(column, row)){
      let value = row[column.assesor]  

      if(column.editable){

        return (
          <InputField
            format={column.format}
            value={value}
            onUpdate={value => {
              this.props.onUpdateRow(column, row, value)
            }}
          />
        )
        
      }else{
        if(column.hasOwnProperty('format')){
          return this.formatColumn(column.format, value)
        }

        return value;
      }
    }

  }

  render(){
    const {
      connectDragPreview,
      connectDragSource,
      connectDropTarget,
      isOver,
      canDrop, 
      index,
      row,
      is_open,
      columns,
      depth,
      onRowContextMenu,
      allowToDragRows
    } = this.props

    let cDP, cDS, cDT;

    if(!allowToDragRows){
      cDP = item => item
      cDS = item => item
      cDT = item => item
      
    }else{
      cDP = connectDragPreview
      cDS = connectDragSource
      cDT = connectDropTarget
    }

    //  Styles

    let className = `Table-Row`

    if(this.props.isSelected){
      className += ' Table-Row-Selected'
    }else{
      className += `${row.is_item ? ' Table-Row-Item': ` Table-Row--depth-${depth}`}`
      className += isOver && canDrop ? ' Table-Row-Over': '';
    }
    

    return cDT(cDP (
      <tr 
        className={className} 
        onContextMenu={onRowContextMenu(row, depth)}
        onClick={this.onRowClick(row)}
        key={index} 
        >
          {
            cDS(
            <td 
              onClick={this.onRowSelect(row)}
              style={{
                width: 25,
                flex: `25 0 auto`,
                maxWidth: 25,
                cursor: allowToDragRows ? 'move' : 'default',
              }}
            >
            </td>
            )}
            
          
          <td 
            onClick={this.onRowExpand(row)}
            style={{
              width: 30,
              maxWidth: 30,
              flex: `25 0 auto`,
            }}
          >
            {!row.is_item && <div className={`Table-Column-${is_open ? 'Expanded' : 'Contracted'}`}></div> }
          </td>

        {columns.map((col, index) => (

          col.Cell ? (
            <td 
              key={index}
              style={{
                width: col.width,
                flex: `${col.width} 0 auto`,
                maxWidth: col.width
              }}
            >
              {col.Cell(row)}
            </td>
            
          ):(
            <td 
              key={index}
              style={{
                width: col.width,
                flex: `${col.width} 0 auto`,
                maxWidth: col.width
              }}
            > 
              {this.renderCell(col, row)}
              
            </td>
          )
          
        ))}
      </tr>
    ))
  }
}

export default flow(
  DragSource(ItemTypes.ROW, RowSource, collectSource),
  DropTarget(ItemTypes.ROW, RowTarget, collectTarget)
)(Row);