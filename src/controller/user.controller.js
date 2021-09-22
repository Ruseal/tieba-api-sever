// 逻辑操作数据返回模块
const jwt = require('jsonwebtoken')

const userService = require('../service/user.service')
const fileService = require('../service/file.service')
const errorType = require('../constents/error-type-text')
const { PRIVATE_KEY } = require('../app/config')
const fs = require('fs')
const { USER_AVATAR_PATH } = require('../constents/file.path')
const { LOGIN_STATUS_OBJ, TOKEN_SAVE_TIME } = require('../constents/global')

class UserController {
  async register(ctx) {
    const { username, password } = ctx.request.body
    try {
      const result = await userService.createUser(username, password)
      ctx.body = {
        status: 200,
        msg: '注册成功',
        data: {
          id: result.insertId,
          username
        },
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  //用户登入返回token
  login(ctx) {
    const { id, username } = ctx.user
    LOGIN_STATUS_OBJ.userId = id
    setTimeout(() => {
      LOGIN_STATUS_OBJ.userId = null
    }, TOKEN_SAVE_TIME.tokenSaveTime * 1000)
    //通过jwt生成token
    const token = jwt.sign({ id, username }, PRIVATE_KEY, {
      expiresIn: TOKEN_SAVE_TIME.tokenSaveTime,        //设置几秒后token失效
      algorithm: 'RS256'    //设置编码token时候的算法
    })
    ctx.body = {
      status: 200,
      message: '登入成功',
      data: {
        id,
        username,
      },
      token                      //返回token给前端
    }
  }

  token(ctx) {
    ctx.body = {
      status: 200,
      msg: "token验证成功"
    }
  }

  async userAvatarInfo(ctx) {
    try {
      const { userId } = ctx.params
      const userAvatarInfo = await fileService.getAvatarByuserId(userId)
      ctx.response.set('content-type', userAvatarInfo.mimetype)            //另浏览器识别该文件为图片，否则当做文件直接下载下来
      ctx.body = fs.createReadStream(`${USER_AVATAR_PATH}/${userAvatarInfo.filename}`)
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  removeLoginStatus(ctx) {
    try {
      LOGIN_STATUS_OBJ.userId = null
      ctx.body = {
        status: 200,
        msg: '成功退出登入'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getUserMessage(ctx) {
    try {
      const { id } = ctx.user
      const result = await userService.userMessage(id)
      if (!result) throw new Error()
      ctx.body = {
        status: 200,
        msg: '获取用户信息成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new UserController()

