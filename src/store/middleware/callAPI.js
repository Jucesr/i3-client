const callAPIMiddleware = ({ dispatch, getState }) => {
    return next => action => {
      const {
        type,
        callAPI,
        shouldCallAPI = () => true,
        payload = {}
      } = action
  
      if (!callAPI) {
        // Normal action: pass it on
        return next(action)
      }

      if ( typeof type != 'string') {
        throw new Error('Expected type to be a string.')
      }
  
      if (typeof callAPI !== 'function') {
        throw new Error('Expected callAPI to be a function.')
      }

      if (!shouldCallAPI(getState())) {
        return
      }
  
      dispatch({
        ...payload,
        type: `${type}_REQUEST`
      })
      
      return callAPI().then(
        response => 
            dispatch({
              ...payload,
              response,
              type: `${type}_SUCCESS`
            }) 
        , error =>
            dispatch({
                ...payload,
                error,
                type: `${type}_FAILURE`
            })
      )
    }
  }

  export default callAPIMiddleware;