import type {Manipulator} from '../types.t'

const bool: Manipulator<boolean> = (value: any, errorMessage?: string): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  const computedValue = String(value).toLowerCase()
  const isTruthy = computedValue === 'true'
  const isFalsy = computedValue === 'false'
  
  // using xor (^) feels more efficient, but TS disallow it
  // consider ignoring the error
  if (!isTruthy && !isFalsy) {
    throw new Error(errorMessage || `${String(value)} is not boolean`)
  }

  return isTruthy
}

export default bool
