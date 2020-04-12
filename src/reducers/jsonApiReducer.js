import { createActions } from 'reduxsauce';
import { fromJS } from 'immutable';
import merge from 'deepmerge';
import { overwriteMerge, combineMerge } from 'utils';

export const createReducerActions = () =>
  createActions({
    successApi: ['responsePayload'],
    deleteSuccessApi: ['responsePayload', 'includeList']
  });
export const { Types: jsonApiTypes, Creators: jsonApiCreators } = createReducerActions();
export const initialState = fromJS({});

export const jsonApiReducer = (state = initialState, action) => {
  switch (action.type) {
    case jsonApiTypes.SUCCESS_API:
      return fromJS(
        merge.all([state.toJS(), action.responsePayload], {
          arrayMerge: overwriteMerge
        })
      );
    case jsonApiTypes.DELETE_SUCCESS_API:
      return fromJS(action.responsePayload);
  }
  return state;
};

export default jsonApiReducer;
