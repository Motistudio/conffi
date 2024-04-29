import isNil from '../../commons/isNil'
import isComplex from '../../commons/isComplex'

import type {Manipulator} from '../types.t'

/**
 * Resolves a text variable - or throws an error
 */
const text: Manipulator<string> = (value: any, errorMessage?: string): string => {
  if (isNil(value) || isComplex(value) || value === '') {
    throw new Error(errorMessage || `${String(value)} is not a string`)
  }
  return String(value)
}

export default text
