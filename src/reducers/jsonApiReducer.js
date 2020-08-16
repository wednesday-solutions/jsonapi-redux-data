import merge from 'deepmerge';
import { overwriteMerge } from 'utils';
import { actionTypes } from './actions';

export const initialState = {};

export const jsonApiReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SUCCESS_API:
      return merge.all([{ ...state }, action.responsePayload], {
        arrayMerge: overwriteMerge
      });

    case actionTypes.DELETE_SUCCESS_API:
      return { ...action.responsePayload };
  }
  return state;
};

export default jsonApiReducer;
