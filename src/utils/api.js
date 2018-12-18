export const fetchApi = (url, options) => {
  return fetch(url, options)
    .then(response => {
      if(response.status != 200)
        return Promise.reject(response.status)

      return response.json()
    })
}