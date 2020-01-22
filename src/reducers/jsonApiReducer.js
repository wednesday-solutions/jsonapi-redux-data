import { createActions } from 'reduxsauce'
import { fromJS } from 'immutable'
import merge from 'deepmerge'
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

export const jsonApiReducer = (state = initialState, action) => {
  switch (action.type) {
      case jsonApiTypes.SUCCESS_API:
        return fromJS(
          merge.all([state.toJS(), action.responsePayload], {
            arrayMerge: overwriteMerge
          })
        )
    }
    return state
}
    

export default jsonApiReducer
