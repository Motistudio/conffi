import createConfigType from '../../../src/lib/createConfig'
import createConfig from '../../../src/lib/createConfig'

import number from '../../../src/lib/manipulators/number'

import {env, runtime, or, get} from '../../../src/lib/getters'

import setEnv from '../../utils/setEnv'

describe('Config Type', () => {
  const environment = {text: 'some text', numericText: '123', number: 0, anotherNumber: 1, bool: true}
  const reset = setEnv(environment)

  afterAll(reset)

  describe('Simple env config', () => {
    test('Should load a basic config', async () => {
      const create = createConfig<typeof environment>({
        text: env('text').string(),
        numericText: env('numericText').string(),
        number: env('number').number(),
        anotherNumber: env('anotherNumber').number(),
        bool: env('bool').boolean()
      })

      await expect(create()).resolves.toMatchObject(environment)
    })

    test('Fallback to runtime values', async () => {
      const expectedEnv = {
        ...environment,
        numericText2: 123
      }

      const create = createConfig<typeof expectedEnv>({
        text: env('text').string(),
        numericText: env('numericText'),
        numericText2: env('numericText2').number(),
        number: env('number').number(),
        anotherNumber: env('anotherNumber').number(),
        bool: env('bool').boolean()
      })

      await expect(create({'numericText2': expectedEnv.numericText2})).resolves.toMatchObject(expectedEnv)
    })

    test('Should get runtime variable', async () => {
      const runtimeValues = {numericText: '456', bool: false}

      const create = createConfig<typeof environment>({
        text: env('text').string(),
        numericText: runtime().string(),
        number: env('number').number(),
        anotherNumber: env('anotherNumber').number(),
        bool: runtime().boolean()
      })

      await expect(create(runtimeValues)).resolves.toMatchObject({...environment, ...runtimeValues})
    })

    test('Should fallback between runtime and env', async () => {
      const runtimeValues = {numericText: '456', bool: false}

      const create = createConfig<typeof environment>({
        text: or(env('text').string()),
        numericText: or(runtime().string(), env('runtimeText').string()),
        number: env('number').number(),
        anotherNumber: env('anotherNumber').number(),
        bool: or(env('bool').boolean(), runtime().boolean())
      })

      await expect(create(runtimeValues)).resolves.toMatchObject({...environment, numericText: runtimeValues.numericText})
    })

    test('Should support a nested structure', async () => {
      const num = environment.anotherNumber

      const create = createConfigType<{num: number, count: {num: number, num2: number}}>({
        num: runtime().number(),
        count: {
          num: env('anotherNumber').number(),
          num2: env('anotherNumber').number()
        }
      })

      await expect(create({num})).resolves.toMatchObject({
        num,
        count: {num: environment.anotherNumber, num2: environment.anotherNumber}
      })

      await expect(create()).rejects.toThrow() // no runtime num
    })

    test('Should handle async resolve', async () => {
      const runtimeEnv = {
        num: 5,
        numPromise: '5'
      }

      const create = createConfigType({
        num: runtime().number(),
        numPromise: runtime().parse((value) => Promise.resolve(number(value))),
        bool: get(() => Promise.resolve('true')).boolean()
      })

      await expect(create(runtimeEnv)).resolves.toMatchObject({num: 5, numPromise: 5, bool: true})
    })
  })

  describe('Schema-based config definition', () => {
    describe('Basic types', () => {
      test('Should get a textual value', async () => {
        const create = createConfig(({env}) => ({
          textualVar: env('text').string(),
          numericValue: env('number').number(),
          booleanValue: env('bool').boolean()
        }))
        await expect(create()).resolves.toMatchObject({
          textualVar: environment.text,
          numericValue: environment.number,
          booleanValue: environment.bool
        })
      })

      test('Should fail for invalid types', async () => {
        await expect(createConfig(({env}) => ({text: env('not-existing-text')}))()).rejects.toThrow(/not-existing-text/)
        await expect(createConfig(({env}) => ({text: env('not-existing-text').string()}))()).rejects.toThrow(/not-existing-text/)
        await expect(createConfig(({env}) => ({text: env('not-existing-number').number()}))()).rejects.toThrow(/not-existing-number/)
        await expect(createConfig(({env}) => ({text: env('text').number()}))()).rejects.toThrow(/text/)
        await expect(createConfig(({env}) => ({text: env('not-existing-bool').boolean()}))()).rejects.toThrow(/not-existing-bool/)
        await expect(createConfig(({env}) => ({text: env('text').boolean()}))()).rejects.toThrow(/text/)
      })
    })

    describe('Runtime values', () => {
      test('Should get vars from runtime values', async () => {
        const runtimeValues = {numericText: '456', bool: false, age: 21, name: 'moti'}

        const create = createConfig(({or, env, runtime}) => ({
          text: or(env('text').string()),
          numericText: or(runtime().string(), env('runtimeText').string()),
          number: env('number').number(),
          anotherNumber: env('anotherNumber').number(),
          bool: or(env('bool').boolean(), runtime().boolean()),
          optional: env('optional').optional(),
          age: runtime().number().test((num) => num > 18),
          doubleNum: env('anotherNumber').number().parse((n: number) => {
            return n * 2
          })
        }))

        await expect(create(runtimeValues)).resolves.toMatchObject({
          ...environment,
          numericText: runtimeValues.numericText,
          age: runtimeValues.age,
          doubleNum: environment.anotherNumber * 2
        })
      })
    })
  })
})
