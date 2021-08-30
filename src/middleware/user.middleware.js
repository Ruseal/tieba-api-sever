/*  
 *     user验证处理模块 
*/

const errorType = require('../constents/error-type-text')
const userService = require('../service/user.service')
const md5password = require('../utils/encrypted-password')

//定义正则
const nameReg = /^[\w\u4e00-\u9fa5-@=.~、]{1,8}$/
const pwReg = /^(?![_.])[\w.]{6,16}$/

//密码格式校验
const fmCheck = (name, password) => {
  return !nameReg.test(name) || !pwReg.test(password)
}

// 验证注册
const verifyRegister = async (ctx, next) => {
  const { name, password } = ctx.request.body
  // ---------------格式校验-------------
  if (fmCheck(name, password)) {
    const error = new Error(errorType.USER_OR_PASSWORD_RULE_IS_INCORRECT)
    return ctx.app.emit('error', error, ctx)                    //发射“error”监并且传入错误信息和context实例
  }
  // ----------------验证是否不存在该用户名-----------
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

// 验证登入
const verifyLogin = async (ctx, next) => {
  const { name, password } = ctx.request.body
  // --------------------格式校验----------------
  if (fmCheck(name, password)) {
    const error = new Error(errorType.USER_OR_PASSWORD_RULE_IS_INCORRECT)
    return ctx.app.emit('error', error, ctx)                    //发射“error”监并且传入错误信息和context实例
  }

  let ctxUser = {}
  // ---------------------验证是否存在该用户------------------
  try {
    const userResult = await userService.isUseByName(name)
    if (!userResult.length) {
      const error = new Error(errorType.USER_DOES_NOT_EXISTS)
      return ctx.app.emit('error', error, ctx)
    }
    ctxUser = userResult[0]
  } catch (e) {
    const error = new Error(errorType.SERVER_ERROR)
    return ctx.app.emit('error', error, ctx)
  }
  // -----------------验证密码是否正确------------------
  if (ctxUser.password !== md5password(password)) {
    const error = new Error(errorType.PASSWORD_MISTAKE)       //创建错误信息实例
    return ctx.app.emit('error', error, ctx)                    //发射“error”监并且传入错误信息和context实例
  }
  
  ctx.user = ctxUser
  await next()
}


module.exports = {
  verifyRegister,
  encryptedPassword,
  verifyLogin
}