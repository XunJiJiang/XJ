import {
  type UniqueKeyTemplate,
  defaultUniqueKeyTemplate,
  isElement,
} from '@xj-fv/shared'

type RootConfig = {
  keyTemplate: UniqueKeyTemplate
  errorHandler: (err: Error) => void
}

interface RootContext {
  config: RootConfig
}

const rootMap = new WeakMap()

export const getRootContext = (container: Element): RootContext => {
  const context = rootMap.get(container)

  if (!context) {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> root.ts -> getRootContext -> el: ${container}`,
    )
    throw new Error('Root element has not been used')
  }

  return context
}

export const createRoot = (
  container: Element,
  config: Partial<RootConfig> = {},
) => {
  if (!isElement(container)) {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> root.ts -> createRoot -> el: ${container}`,
    )
    throw new Error('Invalid root element')
  }

  if (rootMap.has(container)) {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> root.ts -> createRoot -> el: ${container}`,
    )
    throw new Error('Root element has been used')
  }

  const context: RootContext = {
    config: normalizeConfig(config),
  }

  rootMap.set(container, context)

  const render = (rootComponent: Element): void => {
    if (!isElement(rootComponent)) {
      /*#__PURE__*/ console.log(
        `runtime-core -> src -> root.ts -> createRoot -> el: ${rootComponent}`,
      )
      throw new Error('Invalid root component')
    }
    container.appendChild(rootComponent)
  }

  return {
    render,
  }
}

// config 规范化
const normalizeConfig = (config: Partial<RootConfig>): RootConfig => {
  return {
    keyTemplate: config.keyTemplate || defaultUniqueKeyTemplate,
    errorHandler: config.errorHandler || console.error,
  }
}
