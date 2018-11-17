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
Date: Nov 16, 2018
  * Headers and subheaders can be added in the estimate table

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

