import isThentable from '../../../src/commons/promise/isThentable'
import createOptionalGetter from '../../../src/lib/wrappers/optional'
import createTestGetter from '../../../src/lib/wrappers/test'
import createParseCallback from '../../../src/lib/wrappers/parse'

import type {Getter} from '../../../src/lib/types.t'

describe('Wrappers', () => {
  describe('Optional', () => {
    test('Should create an optional getter', () => {
      const getter: Getter<number> = (key, value) => value as number
      const optional = createOptionalGetter(getter)

      const fail: Getter<number> = () => {
        throw new Error('Fail test')
      }
      const doomedToFailOptional = createOptionalGetter(fail)

      expect(optional('test', 1)).toBe(1)
      expect(doomedToFailOptional('test', 1)).toBe(undefined)
    })

    test('Should test an asynchronous getter', async () => {
      const getter: Getter<number> = (key, value) => Promise.resolve(value) as Promise<number>
      const optional = createOptionalGetter(getter)
      
      const fail: Getter<number> = () => {
        return Promise.reject(new Error('Fail test'))
      }
      const doomedToFailOptional = createOptionalGetter(fail)

      const value = optional('test', 1)
      expect(isThentable(value)).toBe(true)
      await expect(value).resolves.toBe(1)
      
      const value2 = doomedToFailOptional('test', 1)
      expect(isThentable(value2)).toBe(true)
      await expect(value2).resolves.toBe(undefined)
    })
  })

  describe('Custom Test', () => {
    test('Should run a sync test', () => {
      const isBiggerThan5 = (num: number) => num > 5
      const doTest = createTestGetter(isBiggerThan5)
  
      expect(doTest('test key', 6)).toBe(6)
      expect(() => doTest('test key', 4)).toThrow()
    })

    test('Should run an async test', async () => {
      const isBiggerThan5 = (num: number) => Promise.resolve(num > 5)
      const doTest = createTestGetter(isBiggerThan5)
  
      const result = doTest('test key', 6)
      expect(isThentable(result)).toBe(true)
      await expect(doTest('test key', 6)).resolves.toBe(6)
      await expect(doTest('test key', Promise.resolve(6))).resolves.toBe(6)
      await expect(doTest('test key', 4)).rejects.toThrow()
    })

    test('Should work with failures as well', async () => {
      const isBiggerThan5 = (num: number) => {
        if (num < 5) {
          throw new Error('oh no')
        }
        return true
      }
      const isBiggerThan5Async = (num: number) => {
        if (num < 5) {
          return Promise.reject(new Error('oh no'))
        }
        return Promise.resolve(true)
      }
      const doTest = createTestGetter(isBiggerThan5)
      const doAsyncTest = createTestGetter(isBiggerThan5Async)

      // sync
      expect(doTest('test key', 6)).toBe(6)
      expect(() => doTest('test key', 4)).toThrow()
  
      // async
      const result = doAsyncTest('test key', 6)
      expect(isThentable(result)).toBe(true)
      await expect(doAsyncTest('test key', 6)).resolves.toBe(6)
      await expect(doAsyncTest('test key', 4)).rejects.toThrow()
    })
  })

  describe('Custom Parser', () => {
    test('Sync parse', () => {
      const parser = (value: any) => `${String(value)}-${String(value)}`

      const parse = createParseCallback(parser)
      expect(parse('test', 'hello')).toBe('hello-hello')
    })
    
    test('Async parse', async () => {
      const parser = (value: any) => Promise.resolve(`${String(value)}-${String(value)}`)

      const parse = createParseCallback(parser)
      const result = parse('test', 'hello')
      expect(isThentable(result)).toBe(true)
      await expect(parse('test', 'hello')).resolves.toBe('hello-hello')
    })
  })
})
