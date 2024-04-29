import isThentable from '../../commons/promise/isThentable'

import type {ObjectLiteral, Definition, Getter, DeepPartial} from '../types.t'

import createDefinition from '../createDefinition'

/**
 * Resolves a nested structure of definitions
 * @param definition - A nested definition
 * @returns {Promise<object>} The full object as it should be
 */
const resolve = <T extends ObjectLiteral>(definition: Definition<T>, values?: DeepPartial<T>): Promise<T> => {
  // todo: map the promises and do an all() on all of them.
  // then, reconstruct them back into an object
  return Promise.all(Object.entries(definition).map(([key, getter]: [string, Getter<any>]) => {
    if (typeof getter === 'object') {
      return resolve(getter, values ? values[key] : undefined).then((value) => [key, value])
    }
    try {
      const result = getter(key, (values && key in values) ? values[key] : undefined)
      if (isThentable(result)) {
        return result.then((value) => [key, value])
      }
      return Promise.resolve([key, result])
    } catch (e) {
      // fallback to the runtime values
      if (values && key in values) {
        return Promise.resolve([key, values[key]])
      }
      return Promise.reject(e)
    }
  })).then((pairs) => {
    return Object.fromEntries(pairs) as T
  })
}

// TODO: definition or an api-based definition builder
const createConfigType = <T extends ObjectLiteral>(definition: Definition<T> | Parameters<typeof createDefinition<T>>[0]): (values?: DeepPartial<T>) => Promise<T> => {
  if (typeof definition === 'function') {
    const def = createDefinition<T>(definition)

    return (values) => {
      return resolve(def, values)
    }
  }

  return (values) => {
    return resolve(definition, values)
  }
}

export default createConfigType
