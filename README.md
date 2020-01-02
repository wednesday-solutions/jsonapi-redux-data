# JsonApi Redux Data

- Provides methods to make api calls to your JSONApi compliant backend and updates the redux store as well. 

- Combines the data so it is easily accessible 

- Setup in 3 easy steps 

    - Update the reducers / rootReducers like this 
        ```
        ...
        import { jsonApiReducer } from 'jsonapi-redux-data'
        ...
        const rootReducer = combineReducers({
            ...,
            api: jsonApiReducer,
            ...
        })
        ...

        ```
    - Create the api client preferrably in the app.js 
        ```
        ...
        import { createApiClientWithTransform } from './jsonapi-redux-data'
        ...
        // Create redux store with history
        const initialState = {};
        const store = configureStore(initialState, history);
        ...

        createApiClientWithTransform('<base-url>', store)
        ...
        ```
    - Make api call easily and from anywhere 
        ```
        ...
        import { getApi } from '../../jsonapi-redux-data'
        ...

        getApi({ pathname: '<pathname>', include: '<include-string>' })
        ...
        ```
