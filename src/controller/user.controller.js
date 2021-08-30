// 逻辑操作数据返回模块
const jwt = require('jsonwebtoken')

const userService = require('../service/user.service')
const errorType = require('../constents/error-type-text')
const { PRIVATE_KEY } = require('../app/config')

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

  //用户登入返回token
  login(ctx) {
    const { id, name } = ctx.user
    //通过jwt生成token
    const token = jwt.sign({ id, name }, PRIVATE_KEY, {
      expiresIn: 10,        //设置几秒后token失效
      algorithm: 'RS256'    //设置编码token时候的算法
    })
    ctx.body = {
      status: 200,
      message: '登入成功',
      id,
      name,
      token                      //返回token给前端
    }
  }
}

module.exports = new UserController()