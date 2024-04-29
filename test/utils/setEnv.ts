const setEnv = (env: object) => {
  const entries = Object.entries(env)
  const previous = entries.reduce<{[key: string]: any}>((prev, [key, value]) => {
    if (key in process.env) {
      prev[key] = process.env[key]
    }
    process.env[key] = String(value)

    return entries
  }, {})

  return function reset () {
    entries.forEach(([key]) => {
      if (key in previous) {
        process.env[key] = previous[key]
      } else {
        delete process.env[key]
      }
    })
  }
}

export default setEnv
