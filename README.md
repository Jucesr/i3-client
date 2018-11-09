# I3-WEB-CLIENT.
This file is used to explain in detail changes I make to this app as I am buiding it.

<!-- TOC -->

- [I3-WEB-CLIENT.](#i3-web-client)
  - [V0.1](#v01)
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

