import { initialState } from '../reducers/jsonApiReducer';

export const selectApiDomain = state => (state.api || initialState).toJS();

export default selectApiDomain;
