import isThentable from '../../../src/commons/promise/isThentable'

describe('Promise utils', () => {
  describe('isThenable', () => {
    test('Should return if an argument is a thenable object', () => {
      const promise = Promise.resolve()
      const thenable = {then: () => undefined}
      const obj = {}
      const unrelatedType = 0

      expect(isThentable(promise)).toBe(true)
      expect(isThentable(thenable)).toBe(true)
      expect(isThentable(obj)).toBe(false)
      expect(isThentable(unrelatedType)).toBe(false)
    })
  })
})
