// 逻辑操作数据返回模块
const jwt = require('jsonwebtoken')

const userService = require('../service/user.service')
const authService = require('../service/auth.service')
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

  async userRecordTieba(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { id } = ctx.user
      const resultCount = await authService.getRecordLength(id)
      const isResult = await authService.isrecord(id, tiebaId)
      if ((resultCount === 20 && isResult) || (resultCount !== 20 && isResult)) {
        await userService.deleteCurrentRecord(id, tiebaId)
        await userService.addCurrentRecord(id, tiebaId)
      }
      if (resultCount === 20 && !isResult) {
        await userService.deleteFirstRecord(id)
        await userService.addCurrentRecord(id, tiebaId)
      }
      if (resultCount !== 20 && !isResult) {
        await userService.addCurrentRecord(id, tiebaId)
      }
      ctx.body = {
        status: 200,
        msg: '记录访问贴吧成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getRecordList(ctx) {
    try {
      const { id } = ctx.user
      const result = await userService.getRecordListByUserId(id)
      ctx.body = {
        status: 200,
        msg: '查询用户访问贴吧记录成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async isLogin(ctx) {
    ctx.body = {
      status: 200,
      msg: '用户为登入状态'
    }
  }

  async focusUser(ctx) {
    try {
      const { id } = ctx.user
      const { focusId } = ctx.request.body
      const result = await userService.focusUserByUserId(id, focusId)
      let isFocusValue = await authService.isFocusValue(focusId)
      if (isFocusValue === undefined) {
        await authService.createNotice(focusId)
        isFocusValue = 0
      }
      await userService.addNoticeFocusCount(isFocusValue.focus + 1, focusId)
      ctx.body = {
        status: 200,
        msg: '关注用户成功',
        data: result
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async unFocusUser(ctx) {
    try {
      const { id } = ctx.user
      const { focusId } = ctx.request.body
      const result = await userService.unFocusUserByUserId(id, focusId)
      let isFocusValue = await authService.isFocusValue(focusId)
      // if (isFocusValue !== undefined && isFocusValue.focus !== 0) {
      //   await userService.addNoticeFocusCount(isFocusValue.focus - 1, focusId)
      // }
      isFocusValue !== 'undefined' && isFocusValue.focus !== 0 &&
        await userService.addNoticeFocusCount(isFocusValue.focus - 1, focusId)
      ctx.body = {
        status: 200,
        msg: '取消关注用户成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getUserDetail(ctx) {
    try {
      const { userId } = ctx.params
      const detail = await userService.getUserDetail(userId)
      const list = await userService.getUserDeatilList(userId)
      ctx.body = {
        status: 200,
        msg: '查询用户详情页信息成功',
        data: {
          detail,
          list
        }
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async labelObjList(ctx) {
    try {
      const { userId } = ctx.params
      const focus = await userService.getFocusList(userId)
      const fans = await userService.getFansList(userId)
      const tieba = await userService.getTiebaList(userId)
      ctx.body = {
        status: 200,
        msg: '查询用户详情页列表展示信息成功',
        data: {
          focus,
          fans,
          tieba
        }
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async updateUser(ctx) {
    try {
      const { id } = ctx.user
      const { nickname, gender, message } = ctx.request.body
      const result = await userService.updateUserMsg(id, nickname, gender, message)
      ctx.body = {
        status: 200,
        msg: '修改用户资料信息成功',
        result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getUserStar(ctx) {
    try {
      const { id } = ctx.user
      const result = await userService.getUserStar(id)
      ctx.body = {
        status: 200,
        msg: '获取用户收藏列表成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async recordHistory(ctx) {
    try {
      const { id } = ctx.user
      const { articleId } = ctx.request.body
      const historyCount = await authService.getHistroyRecordLength(id)
      const hasHistoryRecord = await authService.hasHistoryRecord(id, articleId)
      if ((historyCount === 100 && hasHistoryRecord) || (historyCount !== 100 && hasHistoryRecord)) {
        await userService.deleteCurrentHistoryRecord(id, articleId)
        await userService.addCurrentHistoryRecord(id, articleId)
      }
      if (historyCount === 100 && !hasHistoryRecord) {
        await userService.deleteFirstHistoryRecord(id)
        await userService.addCurrentHistoryRecord(id, articleId)
      }
      if (historyCount !== 100 && !hasHistoryRecord) {
        await userService.addCurrentHistoryRecord(id, articleId)
      }
      ctx.body = {
        status: 200,
        msg: '记录贴子浏览历史成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getRecordHistory(ctx) {
    try {
      const { id } = ctx.user
      const result = await userService.getRecordHistory(id)
      ctx.body = {
        status: 200,
        msg: '获取历史记录成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async clearUserHistory(ctx) {
    try {
      const { id } = ctx.user
      const result = await userService.deleteUserHistory(id)
      ctx.body = {
        status: 200,
        msg: '清空历史记录成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async openMember(ctx) {
    try {
      const { id } = ctx.user
      const result = await userService.openMember(id)
      ctx.body = {
        status: 200,
        msg: '开通会员成功',
        service: result
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new UserController()

