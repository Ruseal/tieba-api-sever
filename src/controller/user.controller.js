// 逻辑操作数据返回模块

const userService = require('../service/user.service')
const errorType = require('../constents/error-type-text')

let result = null

class UserController {
  async register(ctx) {
    const { name, password } = ctx.request.body
    try {
      result = await userService.createUser(name, password)
      console.log(result);
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
    ctx.body = {
      status: 200,
      msg: '注册成功',
      id: result.insertId,
      name
    }
  }
}

module.exports = new UserController()