import React from 'react'
import {connect} from 'react-redux'

import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

import {
  addMaterial, 
  deleteMaterial,
  updateMaterial,
  loadMaterials,
  importMaterial 
} from "actions/material";

import { addSubHeaderTools, clearSubHeaderTools } from "actions/ui";

import Table from "components/Table/Table"
import ImportItemWindow from "components/ImportItemWindow"
import Toolbar from "components/Toolbar"

class Material extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      items_selected: []
    }
  }

  componentDidMount = () => {

    //  Load tools for this route
    this.props.addSubHeaderTools(['ToggleImportWindow'])

    this.props.loadMaterials(this.getProjectId())
  }

  componentWillUnmount = () => {
    //  Remove any tool load by this route
    this.props.clearSubHeaderTools()
  }

  getProjectId = () => {
    const url_parts = this.props.location.pathname.split('/');
    const project_id = url_parts[2] 

    return project_id
  }

  onItemRowUpdate = (column, row, value) => {
    this.props.updateMaterial({
      id: row.id,
      [column.assesor]: value
    })
  }

  onItemRowSelected = rows => {
    this.setState(prevState => ({
      items_selected: rows
    }))
  }

  addMaterial = material => {
    this.props.addMaterial({
      ...material,
      project_id: this.props.active_project,
      is_service: 0,
      base_cost: material.unit_rate,
      other_cost: 0,
      waste_cost: 0,
    })
  }

  onMoveRowFromImportToModule = (source, target) => {

    this.props.importMaterial(this.getProjectId(), {
      id: source.id,
      parent_id: target.id
    })
  }

  canDropRowModule = (props, monitor) => {

    const {row} = props
    const row_being_drag = monitor.getItem().row

    if(row_being_drag.is_item){
      //  It's a line item
      if(row.is_item){
        return true
      }else{
        //  Check if it has children
        if(row.hasOwnProperty('_children') && row._children.length > 0){
          let child = this.props.materials[row._children[0]]
          
          return child.is_item
            
        }else{
          return true
        //  Empty it does not have children
        }
      } 
     }else{
      //  It's a header.
      if(!row.is_item){
         //  Check if it has children
         if(row.hasOwnProperty('_children') && row._children.length > 0){
          let child = this.props.materials[row._children[0]]
          
          return !child.is_item
            
        }else{
          return true
        //  Empty it does not have children
        }
      }
      
      return false
      }
  }

  getToolbarItems = () => {

    const {props, state} = this

    const getChildren = (children) => {

      return children.reduce((acum, child_id) => {
        let new_children = []
        let child = props.materials[child_id]
        if(child.hasOwnProperty('_children')){
          new_children = getChildren(child._children)
        }

        return [
          ...acum,
          ...new_children,
          child_id
        ]
      }, [])
      
    }

    let toolbar_items = [{
      name: 'Add root element',
      action: () => {

        let rootElements = Object.keys(props.materials).reduce((acum, key) => {
          if(props.materials[key].parent_id == null){
            return [
              ...acum,
              props.materials[key]
            ]
          }
          return acum
        }, [])

        rootElements = rootElements.sort((a,b) => a.code - b.code)

        let code = rootElements.length > 0 ? rootElements.slice(-1)[0].code : 'A'
        
        this.addMaterial({
          is_item: 0,
          parent_id: null,
          code: (code + 1).toString().padStart(2, '0'),
          description: " ",
          uom: null,
          currency: null,
          unit_rate: null
      })
        

      }
    }]

    if(state.items_selected.length > 0){
      if(state.items_selected.length == 1){
        //  Get the row selected from the props.
        let item_selected = props.materials[state.items_selected[0]]

        if(item_selected.is_item){
          //  Item
          toolbar_items = [
            ...toolbar_items,
            {
              name: 'Delete item',
              action: () => {
  
                this.setState(prevState => ({
                  items_selected: []
                }))
  
                this.props.deleteMaterial(item_selected)
              }
            }
          ]
        }else{
          //  Header
          toolbar_items = [
            ...toolbar_items,
            {
              name: 'Delete header',
              action: () => {
                //  It needs to delete the header and all sub items/headers

                let children = item_selected.hasOwnProperty('_children') ? getChildren(item_selected._children) : []

                let itemsToBeDeleted = [
                  item_selected.id,
                  ...children
                ]
                
                this.setState(prevState => ({
                  items_selected: []
                }))
                itemsToBeDeleted.forEach(id => this.props.deleteMaterial({
                  id: id
                }))
              }
            }
          ]

          if(item_selected.hasOwnProperty('_children') && item_selected._children.length > 0){
            //  Check the kind of children it has, it could be items or headers
            let child = props.materials[item_selected._children[0]]
            if(child.is_item){
              //  It has items
              toolbar_items = [
                ...toolbar_items,
                {
                  name: 'Add item',
                  action: async () => {

                    let me = props.materials[item_selected.id]
                    
                    let children = me._children.map(child => props.materials[child])
            
                    children = children.sort((a,b) => a.code - b.code)
            
                    let code = parseInt(children.slice(-1)[0].code.slice(-2))

                    this.addMaterial({
                      is_item: 1,
                      parent_id: item_selected.id,
                      code: `${item_selected.code}${code}`,
                      description: " ",
                      uom: null,
                      currency: "MXN",
                      unit_rate: 0
                    })
                  }
                }
              ]
            }else{
              //  It has more headers
              toolbar_items = [
                ...toolbar_items,
                {
                  name: 'Add header',
                  action: () => {
                    let me = props.materials[item_selected.id]
                    
                    let children = me._children.map(child => props.materials[child])
            
                    children = children.sort((a,b) => a.code - b.code)
            
                    let code = parseInt(children.slice(-1)[0].code)

                    this.addMaterial({
                      is_item: 0,
                      parent_id: item_selected.id,
                      code: `${item_selected.code}.${code}`,
                      description: " ",
                      uom: null,
                      currency: null,
                      unit_rate: null
                    })
                  }
                }
              ]
            }
            
          }else{
            //  It's empty, free to add items of sub-headers
            toolbar_items = [
              ...toolbar_items,
              {
                name: 'Add item',
                action: () => {

                  this.addMaterial({
                    is_item: 1,
                    parent_id: item_selected.id,
                    code: `${item_selected.code}01`,
                    description: " ",
                    uom: null,
                    currency: "MXN",
                    unit_rate: 0
                  })
                }
              },
              {
                name: 'Add header',
                action: () => {
                  this.addMaterial({
                    is_item: 0,
                    parent_id: item_selected.id,
                    code: `${item_selected.code}01`,
                    description: " ",
                    uom: null,
                    currency: null,
                    unit_rate: null
                  })
                }
              }
            ]
          }
          
        }
      }else{
        //  More than 1 row selected
        toolbar_items.push({
          name: 'Delete items',
          action: () => {
            let itemsToBeDeleted = state.items_selected

            itemsToBeDeleted = itemsToBeDeleted.reduce((acum, item_id) => {
              let children = []
              let item = props.materials[item_id]
              if(item.hasOwnProperty('_children')){
                children = getChildren(item._children)
              }

              return [
                item_id,
                ...acum,
                ...children
              ]
            }, [])

            this.setState(prevState => ({
              items_selected: []
            }))

            itemsToBeDeleted.forEach(id => this.props.deleteMaterial({
              id: id
            }))
          }
        })
      }
    }

    return toolbar_items
  }

  render(){
    const {
      is_import_window_visible,
      is_loading,
      materials: table_rows
    } = this.props

    //  Toolbar items

    let toolbar_items = this.getToolbarItems()

    return (
      <ReflexContainer
        orientation="vertical"
      >
      {/* Main window (Left)*/}
    
      <ReflexElement>
        <ReflexContainer 
            orientation="horizontal"
        >
          <ReflexElement size={30}>
            <Toolbar 
              items={toolbar_items}
            />
          </ReflexElement>
          <ReflexElement>
            <Table 
              appElement="#app"
              loaderAvatar="/images/loader.gif"
              allowToDragRows={true}
              canDropRow={this.canDropRowModule}
              selected_rows={this.state.items_selected}
              isLoading={is_loading}
              noRowsMessage="No materials loaded"
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
                editable: true,
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
                editable: true,
                onlyItems: true,
                format: 'currency'
              },{
                Header: 'Currency',
                editable: true,
                onlyItems: true,
                assesor: 'currency'
              }]}
              rows={table_rows}
              onRowSelect={this.onItemRowSelected}
              onUpdateRow={this.onItemRowUpdate}
            /> 
          </ReflexElement>
          
        </ReflexContainer> 

      </ReflexElement>
      
      <ReflexSplitter/>

      {/* Import window (Right) */}
      {is_import_window_visible && 
        <ReflexElement
          className="left-pane"
          propagateDimensions={true} 
          resizeWidth={false}
          resizeHeight={false}
        >

        <ReflexContainer
          orientation="horizontal"
          windowResizeAware={true} 
        >
          <ReflexElement
            propagateDimensions={true} 
            resizeWidth={false}
            resizeHeight={false}
          >
            <ImportItemWindow
              onDropRow={this.onMoveRowFromImportToModule}
              type='materials'
            />
            
          </ReflexElement>
        </ReflexContainer>

        </ReflexElement>
      }

      </ReflexContainer>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  addMaterial: material => dispatch(addMaterial(material)),
  deleteMaterial: material => dispatch(deleteMaterial(material)),
  loadMaterials: project_id => dispatch(loadMaterials(project_id)),
  updateMaterial: material => dispatch(updateMaterial(material)),
  importMaterial: (project_id, material) => dispatch(importMaterial(project_id, material)),

  addSubHeaderTools: tools => dispatch(addSubHeaderTools(tools)),
  clearSubHeaderTools: () => dispatch(clearSubHeaderTools()),
})

const mapStateToProps = (state) => ({ 
  materials: state.materials.entities,
  active_project: state.projects.active,
  is_loading: state.materials.isFetching,
  is_import_window_visible: state.ui.is_import_window_visible
})

export default connect(mapStateToProps, mapDispatchToProps)(Material);