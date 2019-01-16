const initialState = {
  entities: {},
  error: null,
  isFetching: false,
  active: undefined
}

export default (state = initialState, action = {}) => {
  const { error, type, response, payload} = action;

  switch (type) {

    case 'COPY_MATERIAL_SUCCESS':
    case 'ADD_MATERIAL_SUCCESS': {
      return {
        ...state,
        entities: {
          ...state.entities,
          [response.id]: response
        }
      }
    }

    case 'UNLOAD_MATERIALS': {
      return {
        ...state,
        entities: {}
      };
    }
    
    case 'LOAD_MATERIALS_REQUEST':
    case 'LOAD_MATERIAL_REQUEST': {
      return {
        ...state,
        isFetching: true
      };
    }

    case 'LOAD_MATERIAL_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_MATERIAL_SUCCESS': {

      return {
        ...state,
        entities: {
          ...state.entities,
          [response.id]: {
            ...response
          }
        },
        error: null,
        isFetching: false
      };
    }

    case 'LOAD_MATERIALS_FAILURE': {
      return {
        ...state,
        error,
        isFetching: false
      };
    }

    case 'LOAD_MATERIALS_SUCCESS': {

      //  It first transform the array into an object.
      let materialsObject = response.reduce((acum, current) => {
        return {
          ...acum,
          [current.id]: current
        }
      }, {})

      //  It adds the property child to entities based on parent id.
      Object.keys(materialsObject).forEach(key => {
          if(materialsObject[key].parent_id != null){
            const parent_id = materialsObject[key].parent_id
            //  The material belongs to a category material. It needs to add it as it's child
            if(!materialsObject[parent_id].hasOwnProperty('_children')){
              materialsObject[parent_id]._children = []
            }
            materialsObject[parent_id]._children.push(key) 
          }
      })

      return {
        ...state,
        entities: {
          ...state.entities,
          ...materialsObject
        },
        error: null,
        isFetching: false
      };
    }

    default: {
      return state;
    }
  }
};
