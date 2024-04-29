import isThentable from '../../commons/promise/isThentable'
import type {Getter, GetterType} from '../types.t'

const createOptionalGetter = <T extends Getter<any>>(callback: T): Getter<GetterType<T> | undefined> => {
  return (key, value) => {
    try {
      const result = callback(key, value)
      if (isThentable(result)) {
        return result.catch(() => undefined) as Promise<GetterType<T> | undefined>
      }
      return result
    } catch (e) {
      return undefined
    }
  }
}

export default createOptionalGetter
