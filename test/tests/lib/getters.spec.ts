import isThentable from '../../../src/commons/promise/isThentable'
import env from '../../../src/lib/getters/env'
import runtime from '../../../src/lib/getters/runtime'
import or from '../../../src/lib/getters/or'

import type {Getter} from '../../../src/lib/types.t'

import setEnv from '../../utils/setEnv'

describe('Getters & Manipulators', () => {
  const environment = {text: 'wow'}
  const reset = setEnv(environment)
  afterAll(reset)

  describe('Env', () => {
    test('Should load a normal text variable', () => {
      const value = env('text')
      expect(value).toBe(environment.text)
    })

    test('Should fail to load un-existing variable', () => {
      expect(() => env('unexisting')).toThrow()
    })
  })

  describe('Runtime', () => {
    test('Should load var from runtime', () => {
      const value = 10
      expect(runtime()('test key', value)).toBe(value)
    })
    
    test('Should fail for no value', () => {
      expect(() => runtime()('test key')).toThrow()
    })
  })

  describe('Or', () => {
    test('Should not be callable without getters', () => {
      expect(() => or()).toThrow()
    })

    test('Should prefer one var or another', () => {
      const getSuccess = () => true
      const getFailure = () => {
        throw new Error('Fail test')
      }
      expect(or(getSuccess)('test key')).toBe(true)
      expect(or(getSuccess, getFailure)('test key')).toBe(true)
      expect(or(getFailure, getSuccess)('test key')).toBe(true)
      expect(or(getFailure, getFailure, getSuccess)('test key')).toBe(true)

      expect(() => or(getFailure)('test key')).toThrow()
      expect(() => or(getFailure, getFailure)('test key')).toThrow()
    })

    test('Should prefer one getter or another - anychronously', async () => {
      const success = true
      const error = new Error('Fail test')

      const getSuccess: Getter<boolean> = () => success
      const getSuccessAsync: Getter<boolean> = () => Promise.resolve(success)
      const getFailure: Getter<boolean> = () => {
        throw error
      }
      const getFailureAsync: Getter<boolean> = () => Promise.reject(error)

      const singleParamSuccessfulOr = or(getSuccessAsync)('test key')
      expect(isThentable(singleParamSuccessfulOr)).toBe(true)
      await expect(singleParamSuccessfulOr).resolves.toBe(success)
      
      const singleParamFailedOr = or(getFailureAsync)('test key')
      expect(isThentable(singleParamFailedOr)).toBe(true)
      await expect(singleParamFailedOr).rejects.toThrow()

      const multiParamSuccessfulOr = or(getFailure, getSuccess, getSuccessAsync)('test key')
      expect(isThentable(multiParamSuccessfulOr)).toBe(false) // since a sync success comes before the async one
      expect(multiParamSuccessfulOr).toBe(success)

      const multiParamSuccessfulAsyncOr = or(getFailure, getFailureAsync, getSuccess)('test key')
      expect(isThentable(multiParamSuccessfulAsyncOr)).toBe(true) // since a sync success comes before the async one
      await expect(multiParamSuccessfulAsyncOr).resolves.toBe(success)

      const multiParamSuccessfulAsyncOr2 = or(getFailure, getFailureAsync, getSuccessAsync)('test key')
      expect(isThentable(multiParamSuccessfulAsyncOr2)).toBe(true) // since a sync success comes before the async one
      await expect(multiParamSuccessfulAsyncOr2).resolves.toBe(success)

      const multiParamFailedAsyncOr = or(getFailure, getFailureAsync)('test key')
      expect(isThentable(multiParamFailedAsyncOr)).toBe(true) // since a sync success comes before the async one
      await expect(multiParamFailedAsyncOr).rejects.toThrow()

      const multiParamFailedAsyncOr2 = or(getFailureAsync, getFailure)('test key')
      expect(isThentable(multiParamFailedAsyncOr2)).toBe(true) // since a sync success comes before the async one
      await expect(multiParamFailedAsyncOr2).rejects.toThrow()
    })
  })
})
