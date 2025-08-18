import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { configDotenv } from 'dotenv'

// 加载 .env 环境变量
configDotenv()

// 日志函数（保持不变）
const log = (message, type = 'info') => {
  const prefixes = {
    info: '\x1b[34m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m'
  }
  console.log(`${prefixes[type]} ${message}`)
}

// 执行命令（支持指定工作目录）
const runCommand = (command, cwd = process.cwd()) => {
  try {
    log(`执行命令: ${command} (在 ${cwd})`)
    execSync(command, { cwd, stdio: 'inherit' })
    return true
  } catch (error) {
    log(`命令执行失败: ${command}`, 'error')
    log(`错误信息: ${error.message}`, 'error')
    process.exit(1)
  }
}

// 检查必要文件（适配monorepo结构）
const checkRequiredFiles = () => {
  const requiredFiles = [
    'package.json', // 根目录package.json
    'package-lock.json',
    'Dockerfile',
    // 'nginx.conf',
  ]

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) {
      log(`缺少必要文件: ${file}`, 'error')
      process.exit(1)
    }
  }
  log('所有必要文件检查通过')
}

// 自增版本号（修改fditor-ui的版本，而非根目录）
const incrementVersion = () => {
  const uiPackagePath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(uiPackagePath, 'utf8'))
  const currentVersion = packageJson.version || '1.0.0'

  const [major, minor, patch] = currentVersion.split('.').map(Number)
  const newVersion = `${major}.${minor}.${patch + 1}`

  packageJson.version = newVersion
  fs.writeFileSync(uiPackagePath, JSON.stringify(packageJson, null, 2) + '\n')

  log(`版本已从 ${currentVersion} 更新为 ${newVersion}`)
  return newVersion
}

// 检查Git工作区是否干净
const checkGitClean = () => {
  try {
    // 检查是否有未提交的更改
    execSync('git diff --quiet', { stdio: 'pipe' })
    execSync('git diff --cached --quiet', { stdio: 'pipe' })
  } catch (error) {
    log(`git工作区有待提交文件`, 'error')
    process.exit(1)
  }
}

// Git提交版本变更并打标签
const gitCommitAndTag = (newVersion) => {
  try {
    // 添加版本文件变更
    // runCommand('git add fditor-ui/package.json')
    runCommand('git add .')

    // 提交变更
    const commitMessage = `chore(release): bump version to ${newVersion}`
    runCommand(`git commit -m "${commitMessage}"`)

    // 创建标签
    const tagName = `v${newVersion}` // 标签格式如 v1.0.1
    runCommand(`git tag -a ${tagName} -m "Release version ${newVersion}"`)

    // 推送提交和标签到远程仓库
    runCommand('git push origin HEAD')
    runCommand(`git push origin ${tagName}`)

    log(`已提交版本变更并创建标签: ${tagName}`, 'success')
  } catch (error) {
    log('Git提交或标签操作失败', 'error')
    process.exit(1)
  }
}

// 检查远程部署所需的环境变量
const checkRemoteEnv = () => {
  const requiredEnv = ['REMOTE_HOST', 'REMOTE_PORT', 'REMOTE_USER']

  // 检查基础必填项
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      log(`缺少远程部署必要环境变量: ${env}`, 'error')
      process.exit(1)
    }
  }

  // 检查认证方式（二选一）
  if (!process.env.REMOTE_SSH_KEY && !process.env.REMOTE_PASSWORD) {
    log('远程部署需要提供SSH密钥路径(REMOTE_SSH_KEY)或密码(REMOTE_PASSWORD)', 'error')
    process.exit(1)
  }
}
// 修复：执行远程SSH命令，确保正确连接
const runRemoteCommand = (host, port, user, authMethod, command) => {
  try {
    // 构建SSH连接基础命令，添加StrictHostKeyChecking=no避免首次连接确认
    let sshBase = `ssh -p ${port} -o StrictHostKeyChecking=no ${user}@${host}`

    // 处理认证方式
    if (authMethod.type === 'key') {
      // 修复：对密钥路径进行转义，处理空格等特殊字符
      const escapedKeyPath = authMethod.keyPath.replace(/(\s)/g, '\\$1')
      sshBase = `ssh -i ${escapedKeyPath} -p ${port} -o StrictHostKeyChecking=no ${user}@${host}`
    } else if (authMethod.type === 'password') {
      // 使用sshpass工具处理密码认证
      sshBase = `sshpass -p '${authMethod.password}' ${sshBase}`
    }

    // 对命令中的特殊字符进行转义
    // const escapedCommand = command.replace(/"/g, '\\"').replace(/\$/g, '\\$')
    const escapedCommand = command
      // 先转义双引号
      .replace(/"/g, '\\"')
      // 再转义 shell 变量，但跳过 awk 单引号里的 $数字
      .replace(/\$(?!\d)/g, '\\$')
    const fullCommand = `${sshBase} "${escapedCommand}"`

    log(`执行远程命令: ${fullCommand}`)
    execSync(fullCommand, { stdio: 'inherit' })
    return true
  } catch (error) {
    log(`远程命令执行失败: ${command}`, 'error')
    log(`错误信息: ${error.message}`, 'error')
    process.exit(1)
  }
}
// 远程部署主函数
const remoteDeploy = () => {
  const host = process.env.REMOTE_HOST
  const port = process.env.REMOTE_PORT || 22
  const user = process.env.REMOTE_USER

  // 确定认证方式
  const authMethod = process.env.REMOTE_SSH_KEY
    ? { type: 'key', keyPath: process.env.REMOTE_SSH_KEY }
    : { type: 'password', password: process.env.REMOTE_PASSWORD }

  log(`开始远程部署到 ${user}@${host}:${port}`)

  // 先测试连接
  try {
    log('测试远程服务器连接...')
    runRemoteCommand(host, port, user, authMethod, 'echo "连接测试成功"')
  } catch (error) {
    log('远程服务器连接失败，请检查配置', 'error')
    process.exit(1)
  }

  // 执行远程部署命令
  /* docker run 优化方向
  1. 添加健康检查：确保容器启动后服务可用（如 HTTP 服务）：
  docker run -d --name ${imageName} -p 80:80 \
  --health-cmd "curl -f http://localhost:80/ || exit 1" \
  --health-interval 10s \
  --health-timeout 5s \
  --health-retries 3 \
  ${imageTag}
  2. 原子性部署：可先启动新容器，确认正常运行后再停止旧容器（避免服务中断）
  3. 日志输出：添加 --log-driver 和 --log-opt 配置日志（如限制大小），避免磁盘占满。 [网页服务好像不需要]
  4. 资源限制：通过 -m 512m --cpus 0.5 限制容器资源，防止影响主机。
  */
  const deployCommands = [
    // 创建工程目录，-p 如果有不会报错
    `mkdir -p ~/deploy`,
    // rm -rf 中的 -r 表示递归删除，-f 表示强制删除（不提示确认）
    `rm -rf ~/deploy/fditor-server`,
    `git clone https://github.com/qcjiamin/fditor-server.git ~/deploy/fditor-server`,
    `cd ~/deploy/fditor-server && docker compose --env-file .env.${process.env.NODE_ENV} up -d --build`,
    // 移除悬空（无标签）镜像 -a 删除未被容器使用的镜像
    `docker image prune -f`,
  ]

  for (const cmd of deployCommands) {
    runRemoteCommand(host, port, user, authMethod, cmd)
  }

  log('远程部署完成', 'success')
}

// 主构建流程
const main = () => {
    try {
        // 1. 检查必要文件
        checkRequiredFiles()
        // 1.1 检查是否有未提交的修改文件
        checkGitClean()
        // 2. 清理旧构建产物
        const distPath = path.join(process.cwd(), 'dist')
        if (fs.existsSync(distPath)) {
          fs.rmSync(distPath, { recursive: true, force: true })
          log('已清理旧构建产物')
        }
        // 3. 自增版本号
        const newVersion = incrementVersion()

        //! 本地build一次，避免到服务器后build报错
        //! 由于设置了NODE_ENV 为 production, 因此不会安装dev依赖,build会失败，这里先关闭4 5 6 步
        // 4. 根目录安装所有依赖（包括workspaces）强制使用现有 lockfile 而不更新它
        // log('安装根目录依赖（包括workspaces）')
        // runCommand('npm ci')

        // 5. 构建
        // log('开始构建')
        // runCommand('npm run build')

        // 6. 检查构建产物
        // if (!fs.existsSync(distPath) || fs.readdirSync(distPath).length === 0) {
        //   log('构建产物为空', 'error')
        //   process.exit(1)
        // }

        // 7. 提交git，并打tag
        gitCommitAndTag(newVersion)

        // 8. 远程部署
        if (process.env.REMOTE_HOST) {
          checkRemoteEnv()
          remoteDeploy()
        } else {
          log('未提供远程服务器信息，跳过自动部署', 'warn')
        }

        log(`构建完成`, 'success')
        process.exit(0)
    } catch (error) {
        log(`构建失败: ${error.message}`, 'error')
        process.exit(1)
    }

}

main()
