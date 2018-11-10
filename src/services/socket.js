import socketIOClient from "socket.io-client"

import { loadLineItemById } from "actions/line_item";

const socket = socketIOClient(API_URL);

export default (store) => {

  socket.on("UPDATE_LINE_ITEM", id => {
    store.dispatch(loadLineItemById(id, {force: true}))
    console.log(id)
  });

}