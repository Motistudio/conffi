import string from '../../../src/lib/manipulators/string'
import number from '../../../src/lib/manipulators/number'
import boolean from '../../../src/lib/manipulators/boolean'

describe('Manipulators', () => {
  describe('String', () => {
    test('Should load a normal text variable', () => {
      const value = 'text'
      expect(string(value)).toBe(value)
      const num = 123
      expect(string(num)).toBe(String(num))
      const bool = true
      expect(string(bool)).toBe(String(bool))
    })

    test('Should fail to load un-existing variable', () => {
      expect(() => string(undefined)).toThrow()
      expect(() => string(null)).toThrow()
      expect(() => string(NaN)).toThrow()
      expect(() => string('')).toThrow()
    })
  })

  describe('Boolean', () => {
    test('Should get a boolean value', () => {
      const truthy = 'true'
      expect(boolean(truthy)).toBe(true)
      const falsy = 'false'
      expect(boolean(falsy)).toBe(false)
      // const truthyComplex = 'True'
      // expect(boolean(truthyComplex)).toBe(true)
      // const falsyComplex = 'False'
      // expect(boolean(falsyComplex)).toBe(false)
      const truthyActual = true
      expect(boolean(truthyActual)).toBe(truthyActual)
      const falsyActual = false
      expect(boolean(falsyActual)).toBe(falsyActual)
    })

    test('Should fail to get a non-boolean value', () => {
      expect(() => boolean(undefined)).toThrow()
      expect(() => boolean(null)).toThrow()
      expect(() => boolean(NaN)).toThrow()
      expect(() => boolean('')).toThrow()
      expect(() => boolean('general string')).toThrow()
    })
  })

  describe('Number', () => {
    test('Should get a numeric value', () => {
      const decimal = 123
      expect(number(decimal)).toBe(123)
      const decimalLiteral = '123'
      expect(number(decimalLiteral)).toBe(123)
      const float = '123.123'
      expect(number(float)).toBe(123)
    })

    test('Should fail to get a non-numeric value', () => {
      expect(() => number(undefined)).toThrow()
      expect(() => number(null)).toThrow()
      expect(() => number(NaN)).toThrow()
      expect(() => number('')).toThrow()
      expect(() => number('general string')).toThrow()
    })
  })
})
