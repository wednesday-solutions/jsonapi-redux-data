import { actions } from 'reducers/actions';
import { selectApiDomain } from 'selectors/selectors';
import { deleteRequest, getRequest, patchRequest, postRequest } from './apiService';
import { createDeepInclude } from 'utils/jsonApiUtils';
import { getIncludeList, getStore } from 'utils';

const { successApi, deleteSuccessApi } = actions;

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
export function getApi(requestPayload, api, axiosConfig) {
  const { include, filter, pathname, levelOfNesting, transformList, id } = requestPayload;
  let includeList = getIncludeList(requestPayload);
  return getRequest(pathname, include, filter, id, api, axiosConfig).then(response =>
    handleApiResponse(response, includeList, transformList, levelOfNesting)
  );
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
export function postApi(requestPayload, api, axiosConfig) {
  const { include, filter, pathname, levelOfNesting, transformList, postData } = requestPayload;
  let includeList = getIncludeList(requestPayload);
  return postRequest(pathname, include, filter, postData, api, axiosConfig).then(response =>
    handleApiResponse(response, includeList, transformList, levelOfNesting)
  );
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
export function patchApi(requestPayload, api, axios) {
  const { include, filter, pathname, levelOfNesting, transformList, patchData, id } = requestPayload;
  let includeList = getIncludeList(requestPayload);
  patchData.data.id = id;
  return patchRequest(pathname, include, filter, id, patchData, api, axios).then(response =>
    handleApiResponse(response, includeList, transformList, levelOfNesting)
  );
}

/**
 * Make a delete request and add api response to the redux store
 * @param  {} requestPayload: {
 *   pathname: String,
 *   id: String
 * }
 * @param {} api: Custom Api Client instead of the latest created api client
 * @param {} axios: Special axios config
 *
 * */
export function deleteApi(requestPayload, api, axios) {
  const { pathname, id } = requestPayload;
  return deleteRequest(pathname, id, api, axios).then(response =>
    handleApiResponse(response, [pathname], null, null, id)
  );
}
/**
 *
 * Handle the response from the api and update the redux store
 * @param  {} response: response of the jsonApi
 * @param  {} includeList: list of keys that need to be included
 * @param  {} transformList: transformations to normalise data
 * @param  {} levelOfNesting: level of nesting in the include
 * @param  {} deletedId: id of deleted element
 */
function handleApiResponse(response, includeList, transformList, levelOfNesting, deletedId) {
  const { data, ok } = response;
  if (ok) {
    const store = getStore();
    const state = selectApiDomain(store.getState());
    const dispatchFn = deletedId ? deleteSuccessApi : successApi;
    store.dispatch(
      dispatchFn(createDeepInclude(data, includeList, transformList, levelOfNesting, state, deletedId), includeList)
    );
  } else {
    throw new Error('Api Failure', data);
  }
}
