export const makeMap = <T extends string = string>(
  str: string,
  expectsLowerCase?: boolean,
) => {
  const set = new Set(str.split(','))
  return expectsLowerCase
    ? (key: string): key is T => set.has(key.toLowerCase())
    : (key: string): key is T => set.has(key)
}
