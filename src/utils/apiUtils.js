import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

import { create } from 'apisauce';
import { setStore, mapKeysDeep } from 'utils';

let latestApiClient = null;
/**
 * @param  baseURL:    baseURL for the api client to which all requests will be made.
 * @param  store:      an object of the redux store. It is used to
 *                     dispatch actions and update the redux store
 *                     based on successful api responses
 * @param  headers:    request headers to be added.
 *                     default value = { 'Content-Type': 'application/vnd.api+json' }
 */
export const createApiClientWithTransform = (
  baseURL,
  store,
  headers = { 'Content-Type': 'application/vnd.api+json' }
) => {
  const apiClient = create({
    baseURL,
    headers
  });
  apiClient.addResponseTransform(response => {
    const { ok, data } = response;
    if (ok && data) {
      response.data = mapKeysDeep(data, keys => camelCase(keys));
    }
    return response;
  });

  apiClient.addRequestTransform(request => {
    const { data } = request;
    if (data) {
      request.data = mapKeysDeep(data, keys => snakeCase(keys));
    }
    return request;
  });
  setStore(store);
  setLatestApiClient(apiClient);
  return apiClient;
};

export const setLatestApiClient = apiClient => {
  latestApiClient = apiClient;
};
/**
 * Get the latest created Api client.
 * This is useful when multiple api clients are required
 */
export const getLatestApiClient = () => {
  return latestApiClient;
};
