import isComplex from '../../../src/commons/isComplex'

describe('Is Complex', () => {
  test('Should indicate complex types', () => {
    expect(isComplex({})).toBe(true)
    expect(isComplex([])).toBe(true)
    expect(isComplex(() => undefined)).toBe(true)
    expect(isComplex(undefined)).toBe(false)
    expect(isComplex(null)).toBe(false)
    expect(isComplex(NaN)).toBe(false)
    expect(isComplex(true)).toBe(false)
    expect(isComplex(0)).toBe(false)
    expect(isComplex(10)).toBe(false)
    expect(isComplex('str')).toBe(false)
  })
})
