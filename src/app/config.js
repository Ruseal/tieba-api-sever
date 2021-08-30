// 获取.env文件常量并进行处理

const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_POLL,

  APP_PORT,

  NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH
} = process.env