import type {Definition, ObjectLiteral} from '../types.t'

import {env, runtime, or, get} from '../getters'

const mainGetters = {
  env,
  runtime,
  get,
  or
}

const createDefinition = <T extends ObjectLiteral>(creator: (getters: typeof mainGetters) => Definition<T>): Definition<T> => {
  return creator(mainGetters)
}

export default createDefinition
