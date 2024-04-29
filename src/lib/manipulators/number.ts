import type {Manipulator} from '../types.t'

const number: Manipulator<number> = (value: any, errorMessage?: string): number => {
  const num = Number.parseInt(value, 10)
  if (Number.isNaN(num)) {
    throw new Error(errorMessage || `${String(value)} is not a number`)
  }
  return num
}

export default number
