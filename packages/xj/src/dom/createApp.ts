export const createApp = (root: HTMLElement) => {
  return {
    mount: (component: HTMLElement) => {
      root.appendChild(component)
    }
  }
}
