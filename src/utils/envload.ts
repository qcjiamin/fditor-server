import { configDotenv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 获取当前文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);

//! 环境变量的加载不导出方法，而是自运行，因为需要保证必须在其他单元运行前已经加载环境变量
// 可选：加载通用配置（如果有的话，会被环境配置覆盖重复项）
configDotenv();
// 确定当前环境（默认 development）
const env = process.env.NODE_ENV || 'development';
// 加载对应环境的配置文件
configDotenv({
  path: path.resolve(__dirname, '..', '..', `.env.${env}`)
});