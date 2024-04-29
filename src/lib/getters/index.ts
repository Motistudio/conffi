import isThentable from '../../commons/promise/isThentable'

import type {Getter, ApiGetter, Manipulator, GetterValue} from '../types.t'

import text from '../manipulators/text'
import num from '../manipulators/number'
import bool from '../manipulators/boolean'
import createOptionalGetter from '../wrappers/optional'
import createTestGetter from '../wrappers/test'
import createParseGetter from '../wrappers/parse'
import getEnvVar from './env'
import getRuntimeVar from './runtime'
import getFirstOf from './or'

const resolveManipulator = <T>(value: T | Promise<T>, manipulator: Manipulator<T>, errorMessage?: string): T | Promise<T> => {
  if (isThentable(value)) {
    return value.then((val) => {
      return resolveManipulator(val, manipulator, errorMessage)
      // return manipulator(val, errorMessage)
    })
  }
  return manipulator(value, errorMessage)
}

/**
 * Sets the chainable api on a getter.
 * For the sake of efficiency, this function is mutable(!)
 * The point in this is that it's generated in an immutable function, and produces immutable functions as well.
 * @param callback - A getter function
 * @returns A getter function
 */
const setApi = <T extends Getter<any>>(callback: T): ApiGetter<T> => {
  // const textCallback = ((key, value) => text(callback(key, value), `${key} is not a string`)) as Getter<string>
  const textCallback = ((key, value) => resolveManipulator(callback(key, value), text, `${key} is not a string`)) as Getter<string>
  // const numberCallback = ((key, value) => num(callback(key, value), `${key} is not a number`)) as Getter<number>
  const numberCallback = ((key, value) => resolveManipulator(callback(key, value), num, `${key} is not a number`)) as Getter<number>
  // const boolCallback = ((key, value) => bool(callback(key, value), `${key} is not a boolean`)) as Getter<boolean>
  const boolCallback = ((key, value) => resolveManipulator(callback(key, value), bool, `${key} is not a boolean`)) as Getter<boolean>
  const optionalCallback = createOptionalGetter(callback) as Getter<T | undefined>

  Object.assign(callback, {
    text: () => setApi(textCallback),
    number: () => setApi(numberCallback),
    bool: () => setApi(boolCallback),
    optional: () => setApi(optionalCallback), // theoretically should look like test and parse, but it doesn't accept any parameters so it doesn't matter
    test: (...args: Parameters<typeof createTestGetter>) => {
      const testGetter = createTestGetter(...args)
      return setApi((key, value) => testGetter(key, callback(key, value)))
    }, // needs to fix
    parse: (...args: Parameters<typeof createParseGetter>): Getter<any> => {
      const parseGetter = createParseGetter(...args)
      return setApi((key, value) => parseGetter(key, callback(key, value)))
    }
  })

  return callback as unknown as ApiGetter<T>
}

export const env = (name: string): ApiGetter<Getter<string>> => {
  return setApi(() => getEnvVar(name))
}

export const runtime = <T>(): ApiGetter<Getter<T>> => {
  return setApi(getRuntimeVar())
}

export const or = <T extends Getter<any>>(...getters: T[]): ApiGetter<Getter<any>> => {
  return setApi(getFirstOf(...getters))
}

export const get = <T extends () => GetterValue<any>>(callback: T): ApiGetter<Getter<ReturnType<T>>> => {
  return setApi(() => callback())
}
