const fs = require('fs')

const articleService = require('../service/article.service')
const fileService = require('../service/file.service')
const errorType = require('../constents/error-type-text')
const { ARTICLE_PICTRUE_PATH } = require('../constents/file.path')

class ArticleController {
  async createArticle(ctx) {
    try {
      const { id } = ctx.user
      const { title, text } = ctx.request.body
      const { tiebaId } = ctx.params
      const result = await articleService.createArticle(title, text, id, tiebaId)
      ctx.body = {
        status: 200,
        msg: '发表成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async articleDetail(ctx) {
    try {
      const { articleId } = ctx.params
      const data = await articleService.getArticleDetail(articleId)
      ctx.body = {
        status: 200,
        msg: '查询贴子详情成功',
        data,
      }
    } catch (e) {

    }
  }

  async articleList(ctx) {
    try {
      const { size, strId, active, userId } = ctx.query
      let sqlStr = ``
      if (active === '0') {
        sqlStr = `AND p.user_id IN (SELECT user_to_id FROM user_focus_user WHERE user_by_id=${userId})`
      }
      const result = await articleService.getArticleList(size, strId, sqlStr)
      ctx.body = {
        status: 200,
        msg: '查询贴子列表成功',
        data: result
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async deleteArticle(ctx) {
    try {
      const { postId } = ctx.params

      await articleService.deleteArticle(postId)
      ctx.body = {
        status: 200,
        msg: '删除贴子成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async addArticleLike(ctx) {
    try {
      const { articleId } = ctx.params
      const { id } = ctx.user
      const result = await articleService.addArticleLike(articleId, id)
      ctx.body = {
        status: 200,
        msg: '点赞成功',
        result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }

  }

  async removeArticleLike(ctx) {
    try {
      const { articleId } = ctx.params
      const { id } = ctx.user
      const result = await articleService.removeArticleLike(articleId, id)
      ctx.body = {
        status: 200,
        msg: '取消点赞成功',
        result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async addStart(ctx) {
    try {
      const { articleId } = ctx.params
      const { id } = ctx.user
      const result = await articleService.addStart(articleId, id)
      ctx.body = {
        status: 200,
        msg: '收藏成功',
        result
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async removeStart(ctx) {
    try {
      const { articleId } = ctx.params
      const { id } = ctx.user
      const result = await articleService.removeStart(articleId, id)
      ctx.body = {
        status: 200,
        msg: '取消收藏成功',
        result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async articlePictrueUrl(ctx) {
    try {
      const { filename } = ctx.params
      const articlePictrueInfo = await fileService.getArticlePictrueByFilename(filename)
      ctx.response.set('content-type', articlePictrueInfo.mimetype)            //另浏览器识别该文件为图片，否则当做文件直接下载下来
      ctx.body = fs.createReadStream(`${ARTICLE_PICTRUE_PATH}/${filename}`)
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async createTiebaArticle(ctx) {
    try {
      const { title, text } = ctx.request.body
      const { tiebaId } = ctx.params
      await articleService.createArticleByCreateTieba(title, text, tiebaId)
      ctx.body = {
        status: 200,
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new ArticleController()