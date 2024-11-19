export const wait = async (time: number = 20) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0)
    }, time)
  })
}

export const createWait = (time: number = 5) => {
  return async () => {
    await wait(time)
  }
}
