import type {Getter, GetterValue} from '../types.t'

type Parser<T, V = any> = (arg: V) => GetterValue<T>

const createParseCallback = <T, V>(callback: Parser<T, V>): Getter<T> => {
  return (key, value) => callback(value as V)
}

export default createParseCallback
