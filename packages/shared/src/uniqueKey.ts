type Template = `${string | never}#{key}${string | never}`

const templateMap = new Map<string, number>()

export const getUniqueKey = (template: Template = '__:#{key}:__'): string => {
  if (templateMap.has(template)) {
    const count = templateMap.get(template) as number
    templateMap.set(template, count + 1)
    return `${template.replace('#{key}', String(count))}`
  } else {
    templateMap.set(template, 1)
    return `${template.replace('#{key}', '0')}`
  }
}
