#!/bin/sh
# 脚本会在容器所在linux环境，启动容器前运行
set -e

# 确保 logs 目录存在
mkdir -p /home/node/app/logs

# 修正权限（仅当 UID/GID 不匹配时才改，以免浪费启动时间）
if [ "$(stat -c %u /home/node/app/logs)" != "$(id -u 1000)" ] || \
   [ "$(stat -c %g /home/node/app/logs)" != "$(id -g 1000)" ]; then
    echo "Fixing permissions for logs directory..."
    chown -R 1000:1000 /home/node/app/logs
fi

# 切换到 node 用户运行后续启动命令
exec su-exec node "$@"