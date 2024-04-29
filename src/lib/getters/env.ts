import type {Manipulator} from '../types.t'

/**
 * Resolves a text variable - or throws an error
 */
const env: Manipulator<string> = (varName: string, errorMessage?: string): string => {
  const value = process.env[varName]
  if (!value) {
    throw new Error(errorMessage || `Missing variable ${varName}`)
  }
  return value
}

export default env
