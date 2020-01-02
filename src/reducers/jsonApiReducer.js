import { createActions } from 'reduxsauce'
import { fromJS } from 'immutable'
import merge from 'deepmerge'
import produce from 'immer'
import { overwriteMerge } from 'utils'

export const createReducerActions = () =>
  createActions({
    successApi: ['responsePayload']
  })
export const {
  Types: jsonApiTypes,
  Creators: jsonApiCreators
} = createReducerActions()
export const initialState = fromJS({})

export const jsonApiReducer = (state = initialState, action) =>
  produce(state, () => {
    switch (action.type) {
      case jsonApiTypes.SUCCESS_API:
        return fromJS(
          merge.all([state.toJS(), action.responsePayload], {
            arrayMerge: overwriteMerge
          })
        )
    }
    return state
  })

export default jsonApiReducer
