import { initialState } from 'reducers/jsonApiReducer';

export const selectApiDomain = state => ({ ...state.api } || { ...initialState });

export default selectApiDomain;
