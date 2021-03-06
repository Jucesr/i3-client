# I3-WEB-CLIENT.
This file is used to explain in detail changes I make to this app as I am buiding it.

<!-- TOC -->autoauto- [I3-WEB-CLIENT.](#i3-web-client)auto  - [V0.1](#v01)auto  - [V0.2](#v02)auto  - [V0.3](#v03)auto  - [V0.4](#v04)auto  - [V0.5](#v05)auto  - [V0.6](#v06)auto  - [V0.7](#v07)auto  - [Glossary](#glossary)autoauto<!-- /TOC -->

## V0.1
Date: Nov 8, 2018

* Initial commit of this file.
* Change the way CallAPI middleware passes the payload. Now I does not spread the object, it passes as a payload property instead.
* Estimate Route
  * Add more EI to the store.
  * Add UR MXN and UR USD columns to Estimate Table.
  * Add a section for line item details.
  * Remove loadLineItems action from Line item, no longer need it since it is connected with the API.
  * Remove loadEstimateItems action from Estimate Item, no longer need it since it is connected with the API.
  * Move method formatColumn from index to util file.
  * Add 'line item detail' field to Store.

## V0.2
Date: Nov 9, 2018

  * Implement socket IO for real-time data.
  * Estimate Route
    * Change font size for table of LIDs.
    * Quantity of a EI can be changed in the table.
    * Quantity of a LID can be changed in detail table.
    * An estimate item can be selected

## V0.3
Date: Nov 10, 2018
  * Add buttons to the subheader.
    * Button to select another estimate
    * Button to show model.
  * Add Viewer component to render a 3D model.

## V0.4
Date: Nov 12, 2018
  * Add actions and reducer to handle user interface options.
    * Actions to show/hide estimate model.
    * Actions to show/hide estimate details.
  * Add funcionality to add a new EI.  

## V0.5
Date: Nov 13, 2018
  * Change actions to fetch all items insted of fetching 1 by 1. Had to to this because it's easier to fetch all items of a resource.
  * Ability to delete an estimate item.
  * Move expanted state of estimate table to UI state.

## V0.6
Date: Nov 15, 2018
  * [FIX]: Ui estimate_table_expanded now it's updated by the action handler in reducer
  * Split estimate route in 2 different. One to handle estimate and other to hanlde estimate items (table, line items, etc).
  * Change routes. 
    * Each route includes its ID for example '/projects/estimates' became '/projects/1/estimates/2'
    * '/dashboard' --> '/projects'
    * If a user try to reach a route by typing the URL directly in the Browser it validates data exists.
  * Tools in sub header now appear or disappear based on page.

## V0.7
Date: Nov 22, 2018
  * Headers and subheaders can be added in the estimate table
  * Change the way the table is expanted and contracted. OnExpantedChanged is no longer used instead when a user click on a row the expanted state changes, this allow me to expanted more than 1 level at the time.

## V0.7.1
Date: Dec 12, 2018
  * Add a complete new custom table. It allows me to handle easier. Each row in the table may have a property called 'subrows' and can be used to handle any level of depth.
  * Add react-dnd so I had to wrap App component in the html backend.
  * Remove estimate_item reducer from redux store. No longer need it, it will be store in each estimate.

## V0.7.2
Date: Dec 14, 2018
  * Update Table component to hold open rows in a different state. There is not need to implement the method onRowExpand in the parent component since the state it's stored in the Table.
  * Change line items reducer prop items for entities.
  * Add utility tree to hanlde tree operations.

## V0.7.3
Date: Dec 17, 2018
  * Fix position of row action modal. Now it´s fixed so its based on body document.
  * The total of each section is displayed in the Estimate item table.

## V0.7.4
Date: Dec 26, 2018
  * Add state to store materials. Every time LIDs are loaded material are loaded as well.
  * Change name of function to load LIDs loadLineItemDetailsById => loadLineItemDetails.
  * Change the property 'items' for 'entitites' in projects global state.
  * Add fav icon.
  * Add global state in the second argument to the callAPI mmiddleware.

## V0.7.5
Date: Dec 26, 2018
  * Add default picture to projects when picture_url is not provided.
  * Modify method convertArrayInTree. Removed addtion of is_open and is_selected properties

## V0.7.6
Date: Dec 28, 2018
  * Change behevior of Table component. It receivies an object as props instead of an array. This makes it more usable. It holds the tree structure internally.
  * Add Material route, it loads the material of the project.
  * Add unloadMaterial and loadMaterials actions to Material reducer.

## V0.7.7
Date: Dec 30, 2018
  * Add a toolbar in estimate item route.
    * To add estimate items
    * To add headers
    * To delete estimate items
    * To delete headers
  * Remove old EstimateTable that uses React-Table.

## V0.7.8
Date: Dec 31, 2018
  * Estimate items can be updated. (Quantity and Description)

## V0.7.9
Date: Dec 31, 2018
  * Add action loadLineItem, it uses fetchApi method. 

## V0.8.0
Date: Jan 16, 2019
  * Add currency type for InputField component.
  * Add onCellClick event in Table and Row component.
  * Add CommodityWindow component.
  * Merge estimate_item_selected and estimate_items_selected.
  * Add method to add line item detail in Estimate route.
  * Add method to delete line item.
  * Re-built line item actions to use fetchApi util.
  * Add actions to addMaterial, loadMaterialByCode, copyMaterialToOtherProject 

## V0.8.1
Date: Jan 17, 2019
  * Update Table component to improve filter column performance.
  * Add Line item module route.
  * Add module name in subheader
  * Make subheader and sidebar components independent

## V0.8.2
Date: Jan 21, 2019
  * Update Table component to let parent component provide logic to hanlde dragging and dropping.
  * Add methods to add and delete line items in the Line Item module.

## V0.8.3
Date: Jan 24, 2019
  * Update ImportItemWindow component so it can import both materials and line items
  * Update Table component so parent can update columns. Columns are not store in the state of Table anymore, there is a new field in state to track extra properties of columns called columns_extended.
  * Update index of project route to change width when side bar is open
  * Add tool to subheader, 'toggleImportWindow'
  * Add import_window actions and reducers
  * Update reducers to use 2 util fuctions called 'convertToArrayObject', 'addChildrenToItems' 

## V0.8.4
Date: Jan 25, 2019
  * Add methods to add, delete, update and import materials from the Materials module.
  * Update reducers LOAD_SUCCESS cases. They do not keep the older state, now they only set what is receive from the action.

## V0.8.5
Date: Jan 31, 2019
  * Add method to add line item from the estimate module. The new line items that are created from estimate module will be store in a new category call 'New Line Items' and will not contain description.

## V0.8.6
  Date: Jan 31, 2019
  * Update Table component, the method getColumns will no longer modify props.
  * Add methods to import estimate items. 


## Glossary

* DB = Database
* EI = Estimate Item
* LI = Line Item
* LID = Line Item Detail
* MXN = Mexican Peso
* PRD = Production
* QTO = Quantity take off
* UR = Unit rate
* USD = Usa dollar.

