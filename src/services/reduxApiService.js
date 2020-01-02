import { jsonApiCreators } from 'reducers/jsonApiReducer'
import { selectApiDomain } from 'selectors/selectors'
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest
} from 'services/apiService'
import { createDeepInclude } from 'utils/jsonApiUtils'
import { getIncludeList, getStore } from 'utils'

const { successApi } = jsonApiCreators

/**
 *
 * Make a get request and add api response to the redux store.
 *
 * @param  {} requestPayload: {
 *   include: object
 *   filter: object,
 *   pathname: String,
 *   levelOfNesting: number,
 *   transformList: object,
 *   id: String
 * }
 * @param {} api: Custom Api Client instead of the latest created api client
 * @param {} axios: Special axios config
 **/
export function getApi (requestPayload, api, axiosConfig) {
  const {
    include,
    filter,
    pathname,
    levelOfNesting,
    transformList,
    id
  } = requestPayload
  let includeList = getIncludeList(requestPayload)
  return getRequest(pathname, include, filter, id, api, axiosConfig).then(
    response =>
      handleApiResponse(response, includeList, transformList, levelOfNesting)
  )
}
/**
 * Make a post request and add api response to the redux store
 * @param  {} requestPayload: {
 *     include: object
 *     filter: object,
 *     pathname: String,
 *     levelOfNesting: number,
 *     transformList: object,
 *     postData: object
 *   }
 * @param {} api: Custom Api Client instead of the latest created api client
 * @param {} axios: Special axios config
 */
export function postApi (requestPayload, api, axiosConfig) {
  const {
    include,
    filter,
    pathname,
    levelOfNesting,
    transformList,
    postData
  } = requestPayload
  let includeList = getIncludeList(requestPayload)
  return postRequest(
    pathname,
    include,
    filter,
    postData,
    api,
    axiosConfig
  ).then(response =>
    handleApiResponse(response, includeList, transformList, levelOfNesting)
  )
}

/**
 * Make a patch request and add api response to the redux store
 * @param  {} requestPayload: {
 *   include: object
 *   filter: object,
 *   pathname: String,
 *   levelOfNesting: number,
 *   transformList: object,
 *   patchData: object
 * }
 * @param {} api: Custom Api Client instead of the latest created api client
 * @param {} axios: Special axios config
 *
 * */
export function patchApi (requestPayload, api, axios) {
  console.log('23')
  const {
    include,
    filter,
    pathname,
    levelOfNesting,
    transformList,
    patchData,
    id
  } = requestPayload
  let includeList = getIncludeList(requestPayload)
  patchData.data.id = id
  console.log({ patchData, includeList })
  return patchRequest(
    pathname,
    include,
    filter,
    id,
    patchData,
    api,
    axios
  ).then(response =>
    handleApiResponse(response, includeList, transformList, levelOfNesting)
  )
}

/**
 * Make a delete request and add api response to the redux store
 * @param  {} requestPayload: {
 *   include: object
 *   filter: object,
 *   pathname: String,
 *   levelOfNesting: number,
 *   transformList: object,
 *   id: String
 * }
 * @param {} api: Custom Api Client instead of the latest created api client
 * @param {} axios: Special axios config
 *
 * */
export function deleteApi (requestPayload, api, axios) {
  const {
    include,
    fitler,
    pathname,
    levelOfNesting,
    transformList,
    id
  } = requestPayload
  let includeList = getIncludeList(requestPayload)
  return deleteRequest(pathname, include, fitler, id, api, axios).then(
    response =>
      handleApiResponse(response, includeList, transformList, levelOfNesting)
  )
}
/**
 *
 * Handle the response from the api and update the redux store
 * @param  {} response: response of the jsonApi
 * @param  {} includeList: list of keys that need to be included
 * @param  {} transformList: transformations to normalise data
 * @param  {} levelOfNesting: level of nesting in the include
 */
function handleApiResponse (
  response,
  includeList,
  transformList,
  levelOfNesting
) {
  const { data, ok } = response
  if (ok) {
    const store = getStore()
    const state = selectApiDomain(store.getState())
    store.dispatch(
      successApi(
        createDeepInclude(
          data,
          includeList,
          transformList,
          levelOfNesting,
          state
        )
      )
    )
  } else {
    throw new Error('Api Failure', data)
  }
}
