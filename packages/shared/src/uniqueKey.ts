export type UniqueKeyTemplate = `${string}#{key}${string}`

const templateMap = new Map<string, number>()

export const defaultUniqueKeyTemplate = '__:#{key}:__'

export const getUniqueKey = (
  template: UniqueKeyTemplate = defaultUniqueKeyTemplate,
): string => {
  if (templateMap.has(template)) {
    const count = templateMap.get(template) as number
    templateMap.set(template, count + 1)
    return `${template.replace('#{key}', String(count))}`
  } else {
    templateMap.set(template, 1)
    return `${template.replace('#{key}', '0')}`
  }
}
