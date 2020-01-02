import camelCase from 'lodash/camelCase';
import pluralize from 'pluralize';
import uniq from 'lodash/uniq';

let store = null;

export function getIncludeList(action) {
  const { include, pathname } = action;
  return uniq(
    (include || '')
      .split(',')
      .join('.')
      .split('.')
      .concat(pathname)
      .map(i => pluralize.plural(camelCase(i)))
  );
}

export function getIncludeFilterAndId(i, f, id) {
  let includeString = '';
  let filterString = '';
  let idString = '';
  if (f) {
    filterString += `${i ? `&` : `?`}filter=${f}`;
  }
  if (i) {
    includeString = `?include=${i}`;
  }
  if (id) {
    idString = `/${id}`;
  }
  return { includeString, filterString, idString };
}

export const overwriteMerge = (destinationArray, sourceArray, options) => {
  return _.uniqBy(destinationArray.concat(...sourceArray), 'id');
};

export function setStore(s) {
  store = s;
}

export function getStore() {
  return store;
}

export * from 'utils/apiUtils';
export * from 'utils/jsonApiUtils';