export function createIdGenerator<S extends string>(
  prefix: S
): () => `__${S}::${number}::__`
export function createIdGenerator<S extends string>(
  prefix: S,
  useDashOnly: true
): () => `--${S}--${number}--`
export function createIdGenerator<S extends string>(
  prefix: S,
  useDashOnly?: boolean
) {
  let id = 0

  if (useDashOnly) {
    return () => {
      return `--${prefix}--${id++}--`
    }
  } else {
    return () => {
      return `__${prefix}::${id++}::__`
    }
  }
}

export const createId = createIdGenerator('id')
