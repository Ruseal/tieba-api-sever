const fs = require('fs')

const errorType = require('../constents/error-type-text')
const fileService = require('../service/file.service')
const tiebaService = require('../service/tieba.service')
const {
  TIEBA_AVATAR_PATH
} = require('../constents/file.path')

class TiebaController {
  async tiebaAvatarInfo(ctx) {
    try {
      const { tiebaId } = ctx.params
      const tiebaAvatarInfo = await fileService.getAvatarByTiebaId(tiebaId)
      ctx.response.set('content-type', tiebaAvatarInfo.mimetype)            //另浏览器识别该文件为图片，否则当做文件直接下载下来
      ctx.body = fs.createReadStream(`${TIEBA_AVATAR_PATH}/${tiebaAvatarInfo.filename}`)
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async focusTieba(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { id } = ctx.user
      await tiebaService.tiebaFocus(tiebaId, id)
      ctx.body = {
        status: 200,
        msg: '关注贴吧成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async unFocusTieba(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { id } = ctx.user
      await tiebaService.tiebaUnFocus(tiebaId, id)
      ctx.body = {
        status: 200,
        msg: '取消关注贴吧成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new TiebaController()