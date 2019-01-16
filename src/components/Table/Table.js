import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import RowActionsModal from './RowActionsModal'
import Row  from "./Row"
import "./Table.css"

export default class Table extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      columns: props.columns.map(column => {
        if(!column.hasOwnProperty('is_visible')){
          column.is_visible = true
        }
        return column
      }),
      structure: [],
      open_rows: {},
      splitter_start: 0,
      tableWidth: 0,
      is_setting_open: false,
      row_actions_modal: {
        visible: false,
        x: 0,
        y: 0,
        actions: []
      }
    }

    Modal.setAppElement(this.props.appElement);

    this.container = React.createRef();
  }

  componentDidMount = () => {

    this.updateColumnsWidth()
    this.generateTableStructure()
    
  }

  componentDidUpdate = (prevProps, prevState) => {
    console.log('Did update Table')
    if(this.container.current.offsetWidth != this.state.tableWidth){
      console.log(`There is a diference ${this.container.current.offsetWidth} - ${this.state.tableWidth}`)
      this.updateColumnsWidth()
    }

    if(prevProps.rows != this.props.rows){
      // console.log('rows has changed!')
      // const start = Date.now()
      this.generateTableStructure()
      // const end = Date.now()
      // console.log(end - start)
    }
    
  }

  generateTableStructure = () => {
    //  Look for root elements
    const rows = this.props.rows
    let rootElements = Object.keys(rows).reduce((acum, key) => {
      if(rows[key].parent_id == null){
        return [
          ...acum,
          key
        ]
      }
      return acum
    }, [])

    const generateTree = (elements) => {

      return elements.reduce( (acum, element_id) => {
        const element = rows[element_id]

        if(element.hasOwnProperty('_children')){
          return [
            ...acum,
            {
              id: element_id,
              subrows: element.hasOwnProperty('_children') ? generateTree(element._children) : undefined
            }
          ]
        }
        
        return [
          ...acum,
          {
            id: element_id
          }
        ]

      },[])
    }
    this.setState(prevState => ({
      structure: generateTree(rootElements)
    }))    
  }

  updateColumnsWidth = () => {
    //  This width is the sum of all columns that were not set by the user. Such as Expanded column, Selected column, etc.
    const scrollWidth = 17
    const widthOfDummyColumns = 55 + scrollWidth
    const maxWidth = this.container.current.offsetWidth
    
    const column_width_taken = this.state.columns.reduce((acum, item) => {
      const hasWidth = item.hasOwnProperty('width')
      const isVisible = item.hasOwnProperty('is_visible') ? item.is_visible : true
      const increase = (hasWidth && isVisible) ? item.width : 0
      return {
        free_space: acum.free_space + ((hasWidth && !isVisible) ? item.width_base : 0),
        visible_columns: acum.visible_columns + (isVisible ? 1 : 0),
        number: acum.number + ((hasWidth && isVisible) ? 1 : 0),
        value: acum.value + increase 
      }
    }, {free_space: 0, visible_columns: 0, number: 0, value: 0})

    let new_columns
    if(column_width_taken.visible_columns === column_width_taken.number){
      //  All the columns have width already
      
      //  Check if there are invisible columns 

      if(column_width_taken.visible_columns < this.state.columns.length){
        //  There are at less 1 invisible column. We need to increase the value of other columns

        const increaseBy = column_width_taken.free_space / column_width_taken.visible_columns
        new_columns = this.state.columns.map(column => {
          if(column.is_visible){
            column.width = column.width_base + increaseBy
          }

          return column
        })

      }else{
        //  All columns are visible, Use original width
        new_columns = this.state.columns.map(column => ({
          ...column,
          width: column.width_base
        }))
      }

    }else{
      //  Some columns do not have width property
      const column_width = (maxWidth - column_width_taken.value - widthOfDummyColumns) / (column_width_taken.visible_columns - column_width_taken.number) 

      new_columns = this.state.columns.map(colum => {

        if(!colum.hasOwnProperty('width')){
          colum.width = column_width
          colum.width_base = column_width
        }else{
          colum.width_base = colum.width          
        }
        return colum
      })
    }

    this.setState(prevState => ({
      columns: new_columns,
      tableWidth: this.container.current.offsetWidth
    }))
  }

  onRowSelect = (row, isCtrlPress) => {

    let shouldAdd = !this.props.selected_rows.includes(row.id)

    if(isCtrlPress){
      if(shouldAdd){
        this.props.onRowSelect(this.props.selected_rows.concat(row.id))
      }else{
        this.props.onRowSelect(this.props.selected_rows.filter((srow => srow !== row.id)))
      }
      
    }else{
      if(shouldAdd){
        this.props.onRowSelect([row.id])
      }else{
        this.props.onRowSelect([])
      }
      
    }
  }

  onRowExpand = (row) => {

    

    if(!row.is_item ){
      this.setState(prevState => ({
        open_rows: {
          ...prevState.open_rows,
          [row.id]: prevState.open_rows.hasOwnProperty(row.id) ? !prevState.open_rows[row.id] : true
        }
      }))      
    }

    //  Check if there is an extra hanlder in the parent
    if(this.props.hasOwnProperty('onRowExpand')){
      this.props.onRowExpand(row)
    }
    

  }

  onRowContextMenu = (row, depth) => {
    return (e) => {
      e.preventDefault();
      let xpos = e.pageX
      let ypos = e.pageY
      let actions;

      if(row.is_item){
        //  Line items
        actions = [
          [
            this.generateAction('Edit item', () => {
              console.log('will edit')
            })
          ],[
            this.generateAction('Delete item', () => {
              this.props.onDeleteRow(row)
            })
          ]
        ]
      }else{
        //  Headers
        actions = []
        let hasSubrows = row.hasOwnProperty('subrows')
        //  Do not allow to add line items if subrows are headers.
        if(
          (hasSubrows && row.subrows.length > 0 && row.subrows[0].is_item) ||
          (!hasSubrows) ||
          (hasSubrows && row.subrows.length === 0)
          ){
            
            actions.push([
              this.generateAction('Add line item', () => {
                this.props.onAddRow(row)
              })
            ]) 
          }

        if(
          (hasSubrows && row.subrows.length > 0 && !row.subrows[0].is_item) ||
          (!hasSubrows) ||
          (hasSubrows && row.subrows.length === 0)
          ){
            
            actions.push([
              this.generateAction('Add sub header', () => {
                this.props.onAddSubHeader(row)
              })
            ])
            
          }

        actions.push([
          this.generateAction('Add header', () => {
            this.props.onAddHeader(row)
          })
        ])


        actions.push([
          this.generateAction('Delete header', () => {
            this.props.onDeleteHeader(row)
          })
        ])
      }

      this.setState((prevState) => ({
        row_actions_modal: {
          visible: true,
          x: xpos,
          y: ypos,
          actions: actions
        }
      }))
    }
  }

  generateAction = (title, action) => {
    return {
      title,
      onClick: () => {
        action()
        this.setState((prevState) => ({
          row_actions_modal: {
            visible: false
          }
        }))
      }
    }
  }

  generateRows = (rows, depth) => {
    const columns = this.getVisibleColumns()
    let filter_active = false

    return rows.map((table_row, index) => {
      const row = this.props.rows[table_row.id]

      if(!row){
        return 
      }

      let renderedRows = [];

      let isSelected = this.props.selected_rows.includes(row.id)

      const shouldRender = columns.reduce((acum, current) => {
        if(current.hasOwnProperty('text_filter') && current.text_filter.length > 0){
          let filter = current.text_filter.toString()
          let checkIfIncluded = row => {

            let textToCompare = row[current.assesor].toString().toLowerCase()
            let isIncluded = textToCompare.includes(filter.toLowerCase())

            if(isIncluded )
              return true
            else if(row.hasOwnProperty('subrows')){
              return row.subrows.reduce((current, row) => {
                return current || checkIfIncluded(row)
              }, false)
            }else{
              return false
            }


          }

          let isIncluded = checkIfIncluded(row)

          filter_active = true
          return acum && isIncluded

        }

        return acum && true
      }, true)

      if(shouldRender ){

        renderedRows.push(
          <Row 
            key={row.id}
            index={index}
            row={{
              ...row
            }}
            is_open={this.state.open_rows.hasOwnProperty(row.id) ? this.state.open_rows[row.id] : false}
            isSelected={isSelected}
            columns={columns}
            depth={depth}
            onCellClick={this.props.onCellClick}
            onRowClick={this.props.onRowClick}
            onUpdateRow={this.props.onUpdateRow}
            onRowContextMenu={this.onRowContextMenu}
            onRowExpand={this.onRowExpand}
            onRowSelect={this.onRowSelect}
            onMoveRow={this.props.onMoveRow}
            allowToDragRows={this.props.allowToDragRows}
            onlyItems={this.props.onlyItems}
          />
        )

      }
      //  Check if it has subrows and it's open to render subrows.

      if((!!table_row.subrows ) && (filter_active || !!this.state.open_rows[row.id] )){
        renderedRows.push(
          this.generateRows(table_row.subrows, depth + 1)
        )
      }

      return renderedRows
    })
  }

  // Colum resize

  onResizeColumnStart = (e) => {
    let xpos = e.pageX

    this.setState(prevState => ({
      splitter_start: xpos
    }))
  }

  onResizeColumnDragging = (index) =>{

    return e => {
      let xpos = e.pageX

      if(xpos !== 0) {
        let grow  = this.state.splitter_start - xpos

        grow = this.state.columns[index].width_base + (grow * -1) 

        const columns = this.state.columns.map((colum, i) => {
          if(index === i){
            colum.width = grow
          }

          return colum
        })

        this.setState(prevState => ({
          columns
        }))

      }
  
    }
  }

  onResizeColumnEnd = (index) =>{

    return e => {
      let xpos = e.pageX

      if(xpos !== 0) {
        let grow  = this.state.splitter_start - xpos

        grow = this.state.columns[index].width_base + (grow * -1) 

        const columns = this.state.columns.map((colum, i) => {
          if(index === i){
            colum.width_base = grow
          }

          return colum
        })

        this.setState(prevState => ({
          columns
        }))

      }
  
    }
  }

  onColumFilterChange = (index) => {

    return e => {
      let value = e.target.value
      const columns = this.state.columns.map((colum, i) => {
        if(index === i){
          colum.text_filter = value
        }

        return colum
      })

      this.setState(prevState => ({
        columns
      }))
    }
  }

  getVisibleColumns = () => {
    return this.state.columns.filter(colum => colum.is_visible)
  }

  //  Setting modal methods

  onCloseSetting = () => {
    this.setState(prevState => ({
      is_setting_open: false
    }))
  }

  render(){
    const {rows, isLoading, loaderAvatar, noRowsMessage} = this.props

    const isEmpty = Object.keys(rows).length == 0 && !isLoading

    const columns = this.getVisibleColumns()

    return (
      <div style={{
        height: '100%'
      }}>
        <table 
          style={{
            height: isLoading ? '5%' : '100%',
            // width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '12px'
          }}
          ref={this.container}
        >
        <thead>
          <tr 
            className="Table-Row-Header"
            onContextMenu={e => {
              e.preventDefault();
              let xpos = e.pageX
              let ypos = e.pageY
              let actions = []

              actions.push([
                this.generateAction('Settings', () => {
                  this.setState(prevState => ({
                    is_setting_open: true
                  }))
                })
              ])
            
      
            this.setState((prevState) => ({
              row_actions_modal: {
                visible: true,
                x: xpos,
                y: ypos,
                actions: actions
              }
            }))
            }}
          >
            <td 
              style={{
                width: 25,
                flex: `25 0 auto`,
                maxWidth: 25
              }}
            >
              <div></div>
            </td>
            <td 
              style={{
                width: 30,
                flex: `30 0 auto`,
                maxWidth: 30
                
              }}
            >
              <div></div> 
            </td>
            {
              columns.map((col, index) => (
                <td 
                  className="Table-Column-Header" 
                  key={col.assesor}
                  style={{
                    width: col.width,
                    flex: `${col.width} 0 auto`,
                    maxWidth: col.width
                  }}
                  >
                  <div style={{width: '100%'}}>
                    <div style={{textAlign: 'center'}}>{col.Header}</div>
                    {!!col.filter && <input onChange={this.onColumFilterChange(index)}/>}
                  </div>
                  {
                    index !== columns.length -1 && 
                    <div 
                      className="Table-Column-Header--resizer" 
                      onDragStart={this.onResizeColumnStart}
                      onDrag={this.onResizeColumnDragging(index)}
                      onDragEnd={this.onResizeColumnEnd(index)}
                      >
                      
                    </div>
                  }
                    
                  
                </td>
              ))
            }
          </tr>
        </thead>
        <tbody style={{
          overflowY: 'scroll',
          }}>
          {!isEmpty ? 
            this.generateRows(this.state.structure, 0) 
            : 
            <tr
              className='Table-Row Table-Row-Empty'
            >
              <td colSpan={columns.length}><p>{noRowsMessage}</p></td>
            </tr>
          }
        </tbody>
      </table>

      {isLoading && ( !!loaderAvatar ? 
        <div >
          <img style={{ display:'block', margin: 'auto'}} alt='' src={this.props.loaderAvatar} ></img>
        </div> 
        : 
        <div>Loading...</div>)
      }


        {
          this.state.row_actions_modal.visible &&

          <RowActionsModal
            x={this.state.row_actions_modal.x}
            y={this.state.row_actions_modal.y}
            makeInvisible={() => this.setState((prevState) => ({
                row_actions_modal: {
                  visible: false
                }
              }))
            }
           actions={this.state.row_actions_modal.actions}

          />
        }

        <Modal
          isOpen={this.state.is_setting_open}
          // onAfterOpen={this.afterOpenModal}
          onRequestClose={this.onCloseSetting}
          style={{
            content : {
              top                   : '50%',
              left                  : '50%',
              right                 : 'auto',
              bottom                : 'auto',
              marginRight           : '-50%',
              transform             : 'translate(-50%, -50%)'
            }
          }}
          contentLabel="Example Modal"
        >
          <table className="Table-Settings">
            <thead>
                <tr className="Table-Settings-Header-Row">
                  <td>Column</td>
                  <td>Visible</td>
                </tr>
            </thead>
            <tbody>
            {this.state.columns.map(colum => (
                <tr key={colum.assesor}  >
                  <td className="Table-Settings-Name-Column">{colum.Header}</td>
                  <td
                    className="Table-Settings-Visible-Column"
                    style={{
                      cursor: 'pointer'
                    }}
                    onClick={e => {
                      this.setState(prevState => ({
                        columns: prevState.columns.map(col => {
                          if(col.assesor === colum.assesor){
                            col.is_visible = !col.is_visible
                            col.keep_with = true
                          }else{
                            col.keep_with = false
                          }

                          return col
                        })
                      }), () => this.updateColumnsWidth())
                    }}
                  >
                  {colum.is_visible ? '✓' : 'X'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="Table-Settings-OK-Button" onClick={this.onCloseSetting}>OK</button>
        </Modal>
      </div>
      
    )
  }
}

Table.propTypes = { 
  appElement: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.object.isRequired,
  selected_rows: PropTypes.array,

  onRowClick: PropTypes.func,
  onRowExpand: PropTypes.func,
  onRowSelect: PropTypes.func,
  onCellClick: PropTypes.func,

  onUpdateRow: PropTypes.func,
  onAddRow: PropTypes.func,
  onAddHeader: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onDeleteHeader: PropTypes.func,
  onMoveRow: PropTypes.func,

  allowToDragRows: PropTypes.bool,
  isLoading: PropTypes.bool,
  loaderAvatar: PropTypes.string,
  noRowsMessage: PropTypes.string
};

Table.defaultProps = {
  selected_rows: [],

  onRowClick: () => {},
  onRowSelect: () => {},
  onCellClick: () => {},

  onAddRow: () => {},
  onDeleteRow: () => {},
  onMoveRow: () => {},
  onUpdateRow : () => {},

  allowToDragRows: false,
  isLoading: false,
  noRowsMessage: "Empty table. Right click to add rows"
};