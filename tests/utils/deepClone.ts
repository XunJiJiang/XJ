export const deepClone = <T>(obj: T): T => {
  const map = new WeakMap()

  const _deepClone = <T>(_obj: T): T => {
    if (_obj && _obj instanceof Node) {
      return _obj
    }

    if (typeof _obj !== 'object' || _obj === null) return _obj
    if (map.has(_obj)) return map.get(_obj)

    const result = (Array.isArray(_obj) ? [] : {}) as T

    map.set(_obj, result)

    for (const key in _obj) {
      if (Object.prototype.hasOwnProperty.call(_obj, key)) {
        result[key] = _deepClone(_obj[key])
      }
    }

    return result
  }

  return _deepClone(obj)
}
