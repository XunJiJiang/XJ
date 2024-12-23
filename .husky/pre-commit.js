import { exec } from 'node:child_process'

new Promise((resolve, reject) => {
  exec(
    'git diff --cached --name-only --diff-filter=ACM',
    (error, stdout, stderr) => {
      if (error) {
        reject(`git diff 获取失败\n ${error.message}`)
      }
      if (stderr) {
        reject(`git diff 获取失败\n ${stderr}`)
      }
      resolve(
        stdout
          .toString()
          .split('\n')
          .filter((file) =>
            /^(packages|scripts|tests)\/.*|.*\.(ts|mjs|json|md)$/.test(file)
          )
      )
    }
  )
})
  .then((stagedFiles) => {
    if (stagedFiles.length > 0) {
      return new Promise((resolve, reject) => {
        exec(
          `prettier --check ${stagedFiles.join(' ')}`,
          {
            encoding: 'utf-8'
          },
          (error, _stdout, stderr) => {
            if (error) {
              reject(
                `prettier 格式化检查失败\n ${error.message.replace(`Command failed: prettier --check`, `尝试运行 prettier --write`)}`
              )
            }
            if (stderr) {
              reject(`prettier 格式化检查失败\n ${stderr}`)
            }
            resolve()
          }
        )
      })
    }
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
