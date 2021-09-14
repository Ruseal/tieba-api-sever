const jwt = require('jsonwebtoken')

const { PUBLIC_KEY } = require('../app/config')
const errorType = require('../constents/error-type-text')   //导入错误信息常量
const authService = require('../service/auth.service')

const verifyAuth = async (ctx, next) => {
  const { authorization } = ctx.headers     //获取前端传入的token的值
  //---------------------------判断是否存在token-------------------------------------------
  if (!authorization) {
    const error = new Error(errorType.INVALID_TOKEN)
    return ctx.app.emit('error', error, ctx)
  }
  //-------------------------判断token是否已失效-----------------------
  const token = authorization.replace('Bearer ', '')
  try {
    //解密token，如果报错，则说明token已过期
    const tokenPublic = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256']
    })
    ctx.user = tokenPublic           //将解密后的tonken赋值给user(便于controller模块获取id等值)
  } catch (err) {
    const error = new Error(errorType.TOKEN_EXPIRED)
    return ctx.app.emit('error', error, ctx)
  }
  //-----------------------------------------------------------------
  await next()
}

const verifyPermission = async (ctx, next) => {
  const [tableKey] = Object.keys(ctx.params)
  const tableName = tableKey.replace('Id', '')
  const tableNameId = ctx.params[tableKey]
  const { id } = ctx.user
  try {
    const isPermission = await authService.checkAuth(tableName, tableNameId, id)

    if (!isPermission) throw new Error()
    await next()
  } catch (e) {
    const error = new Error(errorType.UNPERMISSION)
    return ctx.app.emit('error', error, ctx)
  }
}

const verifyTiebaAuth = async (ctx, next) => {
  const { id } = ctx.user
  const { tiebaId } = ctx.params
  try {
    const isMaxAuthTieba = await authService.isMaxAuthTieba(tiebaId, id)
    if (!isMaxAuthTieba) throw new Error()
    await next()
  } catch (e) {
    const error = new Error(errorType.UNPERMISSION)
    return ctx.app.emit('error', error, ctx)
  }
}

// const authLogin

module.exports = {
  verifyAuth,
  verifyPermission,
  verifyTiebaAuth
}