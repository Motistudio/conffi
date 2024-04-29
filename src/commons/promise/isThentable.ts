const isThentable = <T>(arg: unknown): arg is Promise<T> => {
  return typeof arg === 'object' && !!arg && typeof (arg as Promise<T>).then === 'function'
}

export default isThentable
