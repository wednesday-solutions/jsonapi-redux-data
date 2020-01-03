import get from 'lodash/get'
import uniqBy from 'lodash/uniqBy'
import range from 'lodash/range'
import { pluralCamel, singularCamel } from 'utils'

function updateStateWithTransfom (state, dataItem, transformList) {
  if (transformList[pluralCamel(dataItem.type)]) {
    state[transformList[pluralCamel(dataItem.type)]][dataItem.id] = {
      ...state[transformList[pluralCamel(dataItem.type)]][dataItem.id],
      ...dataItem.attributes,
      relationships: dataItem.relationships,
      id: dataItem.id
    }
  }
  if (state[pluralCamel(dataItem.type)]) {
    state[pluralCamel(dataItem.type)][dataItem.id] = {
      ...state[pluralCamel(dataItem.type)][dataItem.id],
      ...dataItem.attributes,
      relationships: dataItem.relationships,
      id: dataItem.id
    }
  }
}
function createMergedStateObject (
  dataArray = [],
  includes = [],
  transformList = {},
  state = {},
  levelOfNesting,
  withTransform
) {
  const callAgain = []
  if (!(dataArray instanceof Array)) {
    dataArray = [dataArray]
  }
  dataArray.forEach(dataItem => {
    // Get the type of the dataItem.
    // Use that as the key in the state object and use the @dataItem.id
    // as the property of state[dataItem.type] to add all the attributes data.
    // Since it is in a map it can be accessed in O(1) complexity
    updateStateWithTransfom(state, dataItem, transformList)

    // if this particular item has any relationships then we need to iterate over those relationships
    Object.keys(get(dataItem, 'relationships', {})).forEach(relationship => {
      if (dataItem.relationships[relationship].data) {
        // if data is present check if it is of type array if not convert it into an array
        // so that it can be iterated easily.
        if (!(dataItem.relationships[relationship].data instanceof Array)) {
          dataItem.relationships[relationship].data = [
            dataItem.relationships[relationship].data
          ]
        }
        // no need for empty arrays
        if (dataItem.relationships[relationship].data.length) {
          state[pluralCamel(dataItem.type)][dataItem.id][
            pluralCamel(relationship)
          ] = {
            ...dataItem.relationships[relationship].data,
            ...state[pluralCamel(dataItem.type)][dataItem.id][
              pluralCamel(relationship)
            ]
          }
        }

        if (withTransform) {
          // it's the data that is being created so add transforms from the previous state
          includes.forEach(includedKey => {
            if (
              includedKey === pluralCamel(relationship) ||
              includedKey === singularCamel(relationship)
            ) {
              // pluralize this so that we are always comparing lists to lists and not list
              includedKey = pluralCamel(relationship)
              
              state[pluralCamel(dataItem.type)][dataItem.id][
                relationship
              ] = uniqBy(dataItem.relationships[relationship].data, 'id').map(
                relationshipData => {
                  if (transformList[includedKey]) {
                    includedKey = transformList[includedKey]
                  }
                  if (
                    !state[includedKey][relationshipData.id] ||
                    Object.keys(state[includedKey][relationshipData.id])
                      .length < 2
                  ) {
                    // if this object is undefined it means that it hasn't been added to the
                    // state as well.
                    // so we push it into an array so that at the end of all the traversals we can
                    // iterate this array and populate the values that we couldn't find the first time
                    // around
                    callAgain.push({
                      relationship: pluralCamel(relationship),
                      id: relationshipData.id,
                      includedKey,
                      stateType: pluralCamel(dataItem.type),
                      stateId: dataItem.id
                    })
                  }

                  return {
                    ...relationshipData,
                    ...state[includedKey][relationshipData.id]
                  }
                }
              )
            }
          })
        }
      }
    })
  })
  range(1, levelOfNesting + 1).forEach(() => {
    callAgain.forEach(item => {
      // withTransform
      const transformStateType =
        transformList[item.stateType] || transformList[pluralCamel(item.stateType)]
      const transformItemRelationship =
        transformList[item.relationship] ||
        transformList[pluralCamel(item.relationship)]
      if (
        transformItemRelationship &&
        state[pluralCamel(item.stateType)][item.stateId][
          transformItemRelationship
        ]
      ) {
        state[pluralCamel(item.stateType)][item.stateId][
          transformItemRelationship
        ] = state[pluralCamel(item.stateType)][item.stateId][
          transformItemRelationship
        ].map(data => ({
          ...data,
          ...state[item.includedKey][data.id]
        }))
      } else if (
        transformStateType &&
        state[transformStateType][item.stateId][transformItemRelationship]
      ) {
        state[transformStateType][item.stateId][
          transformItemRelationship
        ] = state[transformStateType][item.stateId][
          transformItemRelationship
        ].map(data => ({
          ...data,
          ...state[item.includedKey][data.id]
        }))
      } else if (
        state[pluralCamel(item.stateType)][item.stateId][
          pluralCamel(item.relationship)
        ]
      ) {
        if (
          !(
            state[pluralCamel(item.stateType)][item.stateId][
              pluralCamel(item.relationship)
            ] instanceof Array
          )
        ) {
          state[pluralCamel(item.stateType)][item.stateId][
            pluralCamel(item.relationship)
          ] = Object.values(
            state[pluralCamel(item.stateType)][item.stateId][
              pluralCamel(item.relationship)
            ]
          )
        }

        state[pluralCamel(item.stateType)][item.stateId][
          pluralCamel(item.relationship)
        ] = state[pluralCamel(item.stateType)][item.stateId][
          pluralCamel(item.relationship)
        ].map(data => ({
          ...data,
          ...state[item.includedKey][data.id]
        }))
      }
      else if (state[item.stateType][item.stateId][item.relationship]) {
        if (
          !(
            state[item.stateType][item.stateId][item.relationship] instanceof
            Array
          )
        ) {
          state[item.stateType][item.stateId][
            item.relationship
          ] = Object.values(
            state[item.stateType][item.stateId][item.relationship]
          )
        }
        state[item.stateType][item.stateId][item.relationship] = state[
          item.stateType
        ][item.stateId][item.relationship].map(data => ({
          ...data,
          ...state[item.includedKey][data.id]
        }))
      }
    })
  })

  return state
}

const addKeysToState = (arr, state = {}) => {
  arr.forEach(includedKey => {
    if (!state[includedKey]) {
      state[includedKey] = {}
    }
  })
  return state
}
export function createDeepInclude (
  jsonApiResponse = {},
  includes = [],
  transformList = {},
  levelOfNesting = 0,
  state = {}
) {
  // Create a consolidated state object with all the includedKeys
  state = addKeysToState(includes, state)
  state = addKeysToState(Object.keys(transformList), state)
  // update all keys to plural camel case 
  Object.keys(transformList).forEach(transformListItem => {
    transformList[pluralCamel(transformListItem)] = pluralCamel(transformList[transformListItem])
    delete transformList[transformListItem]
  })
  // Extract data and included from the jsonApiResponse Object
  const { data, included } = jsonApiResponse

  state = createMergedStateObject(
    included,
    includes,
    transformList,
    state,
    levelOfNesting,
    true
  )
  state = createMergedStateObject(
    data,
    includes,
    transformList,
    state,
    levelOfNesting,
    true
  )
  return state
}

export function createShallowInclude (
  jsonApiResponse,
  entities,
  transformList = {},
  levelOfNesting = 0
) {
  // Create a consolidated state object with all the includedKeys
  let state = {}
  entities.forEach(includedKey => {
    state[includedKey] = {}
  })
  // Extract data and included from the jsonApiResponse Object
  const { data, included } = jsonApiResponse

  state = createMergedStateObject(
    included,
    entities,
    transformList,
    state,
    levelOfNesting
  )
  state = createMergedStateObject(
    data,
    entities,
    transformList,
    state,
    levelOfNesting
  )
  return state
}

export function handleEmbeddedDocument (data, embeddedDocumentKey) {
  data = data.map(dataItem => {
    dataItem[embeddedDocumentKey] = {
      ...dataItem[embeddedDocumentKey],
      ...get(dataItem[embeddedDocumentKey], 'data.attributes')
    }
    delete dataItem[embeddedDocumentKey].data
    return dataItem
  })
  return data
}

export default {
  createDeepInclude,
  createShallowInclude
}
