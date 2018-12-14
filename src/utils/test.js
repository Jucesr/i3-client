const Tree = require("./Tree").default

const rows = [{
  parent_id: null,
  id: 1,
  name: 'Julio',
},{
  parent_id: 1,
  id: 2,
  name: 'Ericka'
},{
  parent_id: 1,
  id: 3,
  name: 'Corral'
},{
  parent_id: 3,
  id: 4,
  name: 'sub-corral'
}]
let tree = new Tree(rows)
// console.log(JSON.stringify(tree.getTree(),null,2))

console.log(tree.getTree().map(e => e))

tree.updateItemById(4, (function(e){
  e.name = 'Otro'

  return e
}))



console.log(JSON.stringify(tree.getTree(),null,2))