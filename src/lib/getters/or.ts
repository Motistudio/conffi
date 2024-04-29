import isThentable from 'src/commons/promise/isThentable'
import type {Getter, GetterValue} from '../types.t'

const recursiveOr = <V extends GetterValue<any>, T extends Getter<V>>(key: string, value: V | undefined, getters: T[]): V => {
  const [first, ...rest] = getters

  try {
    const result1 = first(key, value) as V
    if (isThentable(result1)) {
      if (!rest.length) {
        return result1
      }
      return result1.catch(() => {
        try {
          return recursiveOr(key, value, rest)
        } catch (e) {
          return Promise.reject(e)
        }
      }) as V
    }
    return result1
  } catch (e) {
    if (!rest.length) {
      throw e
    }
    return recursiveOr(key, value, rest)
  }
}

const or = <V, T extends Getter<any> = Getter<V>>(...getters: T[]): Getter<V> => {
  const gettersLength = getters.length

  if (!gettersLength) {
    throw new Error('or() conjunction expects an array of getters')
  }

  return (key, value) => {
    return recursiveOr(key, value, getters)
  }
}

export default or
