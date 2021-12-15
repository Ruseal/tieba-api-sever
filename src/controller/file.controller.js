const fileService = require("../service/file.service")
const userService = require("../service/user.service")
const tiebaService = require("../service/tieba.service")
const errorType = require("../constents/error-type-text")
const { APP_HOST, APP_PORT } = require('../app/config')
const { LOGIN_STATUS_OBJ: { adminId } } = require('../constents/global')

class FileController {
  async saveUserAvatar(ctx) {
    try {
      const { id } = ctx.user
      const { filename, mimetype, size } = ctx.req.file
      await fileService.uploadUserAvatar(filename, mimetype, size, id)
      const userAvatarUrl = `${APP_HOST}:${APP_PORT}/user/${id}/avatar`
      await userService.updateUserAvatarUrlByuserId(userAvatarUrl, id)
      ctx.body = {
        userAvatarUrl,
        status: 200,
        msg: '上传头像成功'
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async saveTiebaAvatar(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { filename, mimetype, size } = ctx.req.file
      await fileService.uploadTiebaAvatar(filename, mimetype, size, tiebaId)
      const tiebaAvatarUrl = `${APP_HOST}:${APP_PORT}/tieba/${tiebaId}/avatar`
      await tiebaService.updateTiebaAvatarUrlBytiebaId(tiebaAvatarUrl, tiebaId)
      ctx.body = {
        tiebaAvatarUrl,
        status: 200,
        msg: '上传贴吧头像成功'
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async saveArticlePictrue(ctx) {
    try {
      const files = ctx.req.files
      const { id } = ctx.user
      const { articleId } = ctx.query
      for (let file of files) {
        const { filename, mimetype, size } = file
        await fileService.uploadArticlePictrue(filename, mimetype, size, articleId, id)
      }
      ctx.body = {
        status: 200,
        msg: '上传贴子图片成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async saveCommentPictrue(ctx) {
    try {
      const files = ctx.req.files
      const { id } = ctx.user
      const { commentId } = ctx.query
      for (let file of files) {
        const { filename, mimetype, size } = file
        await fileService.uploadCommentPictrue(filename, mimetype, size, commentId, id)
      }
      ctx.body = {
        status: 200,
        msg: '上传贴子的评论图片成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async saveBanner(ctx) {
    try {
      const files = ctx.req.files
      for (let file of files) {
        const { filename, mimetype, size } = file
        await fileService.uploadBanner(filename, mimetype, size, adminId)
      }
      ctx.body = {
        status: 200,
        msg: '上传分类页轮播图成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new FileController()