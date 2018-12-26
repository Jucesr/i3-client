import pick from 'lodash/pick'
import { fetchApi } from "utils/api"

export const loadMaterial = (id) => ({
  type    : 'LOAD_MATERIAL',
  callAPI: async dispatch => {
    let material = await fetchApi(`${API_URL}/material/${id}`)
    return pick(material, [
      "id",
      "is_service",
      "code",
      "description",
      "uom",
      "currency",
      "unit_rate",
    ])
  }
})
