// 错误信息的操作并返回
const errorType = require('../constents/error-type-text')

const errorHandle = (error, ctx) => {
  let status, message
  switch (error.message) {
    case errorType.USER_OR_PASSWORD_RULE_IS_INCORRECT:
      status = 400
      message = '用户名或密码格式错误'
      break
    case errorType.USER_ALREADY_EXISTS:
      status = 400
      message = '用户名已经存在'
      break
    case errorType.SERVER_ERROR:
      status = 500
      message = '服务器错误'
      break
    case errorType.USER_DOES_NOT_EXISTS:
      status = 400
      message = '用户名不存在'
      break
    case errorType.PASSWORD_MISTAKE:
      status = 400
      message = '密码错误'
      break
    default:
      status = 404
      message = '未知错误'
  }

  ctx.body = {
    status,
    msg: message
  }
}

module.exports = errorHandle