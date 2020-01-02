import { camelCase, snakeCase } from 'lodash';

import { create } from 'apisauce';
import mapKeysDeep from 'map-keys-deep';
import { setStore } from './';

let latestApiClient = null;

export const createApiClientWithTransForm = (
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

export const getLatestApiClient = () => {
  return latestApiClient;
};
