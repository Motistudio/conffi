const isComplex = (value: any): value is (object | Array<any> | ((...args: any[]) => any)) => {
  const type = typeof value
  return (!!value && type === 'object') || type === 'function' || type === 'symbol'
}

export default isComplex