import type {Getter} from '../types.t'

import isNil from '../../commons/isNil'

const runtime = <T>(): Getter<T> => {
    // throw if not exist
  return (key, value) => {
    if (isNil(value)) {
      throw new Error(`${key} does not exists`)
    }
    return value
  }
}

export default runtime
