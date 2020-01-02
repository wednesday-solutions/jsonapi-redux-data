import { getLatestApiClient } from '../utils/apiUtils';

import { getIncludeFilterAndId } from '../utils';

/**
 * GET HTTP REQUEST, uses the apisauce.get underneath the hood.
 * @param  {} pathname: the endpoint path
 * @param  {} include: the jsonapi include string
 * @param  {} filter: the jsonapi filter string
 * @param  {} id: the id of the GET request.
 * @param  {} api: default is getLatestApiClient()
 * @param  {} axiosConfig: custom axiosConfig for this request
 */
export const getRequest = (pathname, include = '', filter = '', id = '', api = getLatestApiClient(), axiosConfig) => {
  const { includeString, filterString, idString } = getIncludeFilterAndId(include, filter, id);
  return api.get(`${pathname}${idString}${includeString}${filterString}`, null, axiosConfig);
};
/**
 * PUT HTTP REQUEST, uses the apisauce.get underneath the hood.
 * @param  {} pathname: the endpoint path
 * @param  {} include: the jsonapi include string
 * @param  {} filter: the jsonapi filter string
 * @param  {} id: the id of the PUT request.
 * @param  {} putData: request body
 * @param  {} api: default is getLatestApiClient()
 * @param  {} axiosConfig: custom axiosConfig for this request
 */
export const putRequest = (
  pathname,
  include = '',
  filter = '',
  id = '',
  putData = {},
  api = getLatestApiClient(),
  axiosConfig
) => {
  const { includeString, filterString, idString } = getIncludeFilterAndId(include, filter, id);
  return api.put(`${pathname}${idString}${includeString}${filterString}`, putData, axiosConfig);
};

/**
 * POST HTTP REQUEST, uses the apisauce.get underneath the hood.
 * @param  {} pathname: the endpoint path
 * @param  {} include: the jsonapi include string
 * @param  {} filter: the jsonapi filter string
 * @param  {} postData: request body
 * @param  {} api: default is getLatestApiClient()
 * @param  {} axiosConfig: custom axiosConfig for this request
 */
export const postRequest = (
  pathname,
  include = '',
  filter = '',
  postData = {},
  api = getLatestApiClient(),
  axiosConfig
) => {
  const { includeString, filterString } = getIncludeFilterAndId(include, filter);
  return api.post(`${pathname}${includeString}${filterString}`, postData, axiosConfig);
};

/**
 * DELETE HTTP REQUEST, uses the apisauce.get underneath the hood.
 * @param  {} pathname
 * @param  {} include: the jsonapi include string
 * @param  {} filter: the jsonapi filter string
 * @param  {} id: the id of the DELETE request.
 * @param  {} api: default is getLatestApiClient()
 * @param  {} axiosConfig: custom axiosConfig for this request
 */
export const deleteRequest = (
  pathname,
  include = '',
  filter = '',
  id = '',
  api = getLatestApiClient(),
  axiosConfig
) => {
  const { includeString, filterString, idString } = getIncludeFilterAndId(include, filter, id);
  return api.delete(`${pathname}${idString}${includeString}${filterString}`, null, axiosConfig);
};

/**
 * PATCH HTTP REQUEST, uses the apisauce.get underneath the hood.
 * @param  {} pathname
 * @param  {} include: the jsonapi include string
 * @param  {} filter: the jsonapi filter string
 * @param  {} id: the id of the PATCH request.
 * @param  {} patchData: request body
 * @param  {} api: default is getLatestApiClient()
 * @param  {} axiosConfig: custom axiosConfig for this request
 */
export const patchRequest = (
  pathname,
  include = '',
  filter = '',
  id = '',
  patchData = {},
  api = getLatestApiClient(),
  axiosConfig
) => {
  const { includeString, filterString, idString } = getIncludeFilterAndId(include, filter, id);
  return api.patch(`${pathname}${idString}${includeString}${filterString}`, patchData, axiosConfig);
};
