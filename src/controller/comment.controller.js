const fs = require('fs')

const commentService = require('../service/comment.service')
const errorType = require('../constents/error-type-text')
const fileService = require('../service/file.service')
const { COMMENT_PICTRUE_PATH } = require('../constents/file.path')

class CommentController {
  async createComment(ctx) {
    try {
      const { content, articleId } = ctx.request.body
      const { id } = ctx.user
      const result = await commentService.createComment(content, id, articleId)
      ctx.body = {
        status: 200,
        msg: '发表评论成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async createReply(ctx) {
    try {
      const { content, articleId, commentId } = ctx.request.body
      const { commentReplyId } = ctx.params
      const { id } = ctx.user
      const result = await commentService.createReply(content, articleId, commentId, commentReplyId,id)
      ctx.body = {
        status: 200,
        msg: '回复评论成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async deleteComment(ctx) {
    try {
      const { commentId } = ctx.params
      const result = await commentService.deleteComment(commentId)
      ctx.body = {
        status: 200,
        msg: '删除评论成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async commentList(ctx) {
    try {
      const { articleId, offset, size } = ctx.query
      if (articleId === undefined) throw new Error()
      const data = await commentService.getCommentListByArticleId(articleId, offset, size)
      ctx.body = {
        status: 200,
        msg: '加载评论列表成功',
        data
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async replyList(ctx) {
    try {
      const { commentId } = ctx.params
      const data = await commentService.getReplyListByCommentId(commentId)
      ctx.body = {
        status: 200,
        msg: '加载评论回复成功',
        data
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async addCommentLike(ctx) {
    try {
      const { commentId } = ctx.params
      const { id } = ctx.user
      const result = await commentService.addCommentLike(commentId, id)
      ctx.body = {
        status: 200,
        msg: '点赞评论或回复成功',
        result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async removeCommentLike(ctx) {
    try {
      const { commentId } = ctx.params
      const { id } = ctx.user
      const result = await commentService.removeCommentLike(commentId, id)
      ctx.body = {
        status: 200,
        msg: '取消点赞评论或回复成功',
        result
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async commentPictrueUrl(ctx) {
    try {
      const { filename } = ctx.params
      const commentPictrueInfo = await fileService.getCommentPictrueByFilename(filename)
      ctx.response.set('content-type', commentPictrueInfo.mimetype)            //另浏览器识别该文件为图片，否则当做文件直接下载下来
      ctx.body = fs.createReadStream(`${COMMENT_PICTRUE_PATH}/${filename}`)
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

}

module.exports = new CommentController()