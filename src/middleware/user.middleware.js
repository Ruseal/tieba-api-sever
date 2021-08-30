// user验证处理模块

const errorType = require('../constents/error-type-text')
const config = require('../app/config')
const userService = require('../service/user.service')
const md5password = require('../utils/encrypted-password')

// 验证注册
const verifyRegister = async (ctx, next) => {
  const { name, password } = ctx.request.body

  if (!name || name.length > config.NAME_LENGTH ||
    !password || password.length > config.MAX_PASSWORD_LENGTH ||
    password.length < config.MIN_PASSWORD_LENGTH) {
    const error = new Error(errorType.USER_OR_PASSWORD_RULE_IS_INCORRECT)
    return ctx.app.emit('error', error, ctx)                    //发射“error”监并且传入错误信息和context实例
  }

  try {
    const userResult = await userService.isUseByName(name)
    if (userResult.length) {
      const error = new Error(errorType.USER_ALREADY_EXISTS)
      return ctx.app.emit('error', error, ctx)
    }
  } catch (e) {
    const error = new Error(errorType.SERVER_ERROR)
    return ctx.app.emit('error', error, ctx)
  }

  await next()
}

// 加密密码
const encryptedPassword = async (ctx, next) => {
  const { password } = ctx.request.body
  ctx.request.body.password = md5password(password)
  await next()
}

module.exports = {
  verifyRegister,
  encryptedPassword
}