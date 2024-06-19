export type UniqueKeyTemplate = `${string}#{key}${string}`

const templateMap = new Map<string, string>()

const countAdd = (count: `${number}`): `${number}` => {
  const last = count[count.length - 1]
  if (last === '9') {
    const newCount = countAdd(count.slice(0, -1) as `${number}`)
    return `${newCount}0` as `${number}`
  } else {
    return `${count.slice(0, -1)}${Number(last) + 1}` as `${number}`
  }
}

export const defaultUniqueKeyTemplate = '__:#{key}:__'

export const getUniqueKey = (
  template: UniqueKeyTemplate = defaultUniqueKeyTemplate,
): string => {
  if (templateMap.has(template)) {
    const count = templateMap.get(template) as `${number}`
    templateMap.set(template, countAdd(count))
    return `${template.replace('#{key}', count)}`
  } else {
    templateMap.set(template, '0')
    return `${template.replace('#{key}', '0')}`
  }
}
