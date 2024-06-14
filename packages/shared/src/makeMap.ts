export function makeMap(
  str: string,
  expectsLowerCase?: boolean,
): (key: string) => boolean {
  const set = new Set(str.split(','));
  return expectsLowerCase
    ? val => set.has(val.toLowerCase())
    : val => set.has(val);
}
