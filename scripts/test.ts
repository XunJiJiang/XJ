import { startVitest } from 'vitest/node'
import { packages } from './utils'
import { createVitestConfig } from '../vitest.config'

async function main() {
  try {
    await test()
  } catch (error) {
    console.error(error)
  }
}

main()

async function test() {
  const packageNames = Object.keys(packages)
  for (const [key, value] of Object.entries(packages)) {
    const config = createVitestConfig(
      key,
      packageNames.filter((name) => name !== key)
    )
    const vitest = await startVitest(
      'test',
      [],
      {
        watch: false
      },
      config
    )
  }
}
