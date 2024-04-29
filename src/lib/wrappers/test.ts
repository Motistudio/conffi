import isThentable from '../../commons/promise/isThentable'
import type {Getter} from '../types.t'

type Tester = (value: any) => boolean | Promise<boolean>

const returnOrThrow = <T>(key: string, value: T, indicator: boolean, errorMessage?: string): T => {
  if (!indicator) {
    throw new Error(errorMessage || `Improper '${key}' value`)
  }
  return value
}

const createTestGetter = <T>(callback: Tester, errorMessage?: string): Getter<T> => {
  const test = ((key, value) => {
    if (isThentable(value)) {
      return value.then((val) => test(key, val as T))
    }

    try {
      const result = callback(value)
  
      if (isThentable(result)) {
        return result.then((result) => returnOrThrow<T>(key, value as T, result, errorMessage))
      }
      return returnOrThrow<T>(key, value as T, result, errorMessage)
    } catch (e) {
      throw e as Error
    }
  }) as Getter<T>

  return test
}

export default createTestGetter
