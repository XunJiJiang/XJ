export const createIdGenerator = <S extends string>(
  prefix: S
): (() => `__${S}::${number}::__`) => {
  let id = 0

  return () => {
    return `__${prefix}::${id++}::__`
  }
}

export const createId = createIdGenerator('id')
