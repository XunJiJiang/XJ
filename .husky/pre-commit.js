import { execSync } from 'child_process'

try {
  const stagedFiles = execSync(
    'git diff --cached --name-only --diff-filter=ACM'
  )
    .toString()
    .split('\n')
    .filter((file) =>
      /^(packages|scripts|tests)\/.*|.*\.(ts|mjs|json|md)$/.test(file)
    )

  if (stagedFiles.length > 0) {
    const output = execSync(`prettier --check ${stagedFiles.join(' ')}`, {
      encoding: 'utf-8'
    })

    if (/warn/i.test(output)) {
      execSync(`prettier --write ${stagedFiles.join(' ')}`)
      console.log('代码格式化检查包含警告，提交已取消。')
      process.exit(1)
    }

    if (/error/i.test(output)) {
      execSync(`prettier --write ${stagedFiles.join(' ')}`)
      console.log('代码格式化检查包含错误，提交已取消。')
      process.exit(1)
    }
  }
} catch (error) {
  console.error('pre-commit 脚本执行失败:', error)
  process.exit(1)
}
