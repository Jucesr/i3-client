# I3-WEB-CLIENT.
This file is used to explain in detail changes I make to this app as I am buiding it.

<!-- TOC -->

- [I3-WEB-CLIENT.](#i3-web-client)
  - [V0.1](#v01)
  - [V0.2](#v02)
  - [V0.3](#v03)
  - [Glossary](#glossary)

<!-- /TOC -->

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
