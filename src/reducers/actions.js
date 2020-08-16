export const actionTypes = {
  SUCCESS_API: 'SUCCESS_API',
  DELETE_SUCCESS_API: 'DELETE_SUCCESS_API'
};
export const successApi = responsePayload => {
  return {
    type: actionTypes.SUCCESS_API,
    responsePayload
  };
};

export const deleteSuccessApi = (responsePayload, includeList) => {
  return {
    type: actionTypes.DELETE_SUCCESS_API,
    responsePayload,
    includeList
  };
};
export const actions = {
  successApi,
  deleteSuccessApi
};
