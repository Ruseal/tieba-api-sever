const fs = require('fs')

const errorType = require('../constents/error-type-text')
const fileService = require('../service/file.service')
const tiebaService = require('../service/tieba.service')
const {
  TIEBA_AVATAR_PATH
} = require('../constents/file.path')

class TiebaController {
  async createTieba(ctx) {
    try {
      const { id } = ctx.user
      const { name, indct, categoryId } = ctx.request.body
      const isTieba = await tiebaService.isTieba(name)
      if (isTieba) throw new Error()
      const result = await tiebaService.createTieba(name, indct, id, categoryId)
      ctx.body = {
        status: 200,
        msg: '创建贴吧成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.TIEBAE_ALREADY_EXISTS)
      return ctx.app.emit('error', error, ctx)
    }
  }
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

  async tiebaList(ctx) {
    try {
      const { id } = ctx.user
      const result = await tiebaService.getAllTiebaByUserId(id)
      ctx.body = {
        status: 200,
        msg: '查询用户所有关注贴吧成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getTiebaDeatil(ctx) {
    try {
      const { tiebaId } = ctx.params
      const result = await tiebaService.getTiebaDetail(tiebaId)
      ctx.body = {
        status: 200,
        msg: '查询贴吧详情成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async signIn(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { level, exp } = ctx.request.body
      const { id } = ctx.user
      const result = await tiebaService.updateSign(tiebaId, level, exp, id)
      ctx.body = {
        status: 200,
        msg: '签到成功',
        service: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async articleList(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { offset, size } = ctx.query
      const result = await tiebaService.getArticleList(tiebaId, offset, size)
      ctx.body = {
        status: 200,
        msg: '查询贴吧贴子成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async applyMaxAuth(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { id } = ctx.user
      const result = await tiebaService.setMaxAuth(tiebaId, id)
      ctx.body = {
        status: 200,
        msg: '申请吧主成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async introduction(ctx) {
    try {
      const { tiebaId } = ctx.params
      const { introduction } = ctx.request.body
      const result = await tiebaService.updateTiebaIntroduction(tiebaId, introduction)
      ctx.body = {
        status: 200,
        msg: '修改吧简介成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async singleArticle(ctx) {
    try {
      const { articleId } = ctx.params
      const result = await tiebaService.getSingleArticle(articleId)
      ctx.body = {
        status: 200,
        msg: '查询单个前端文章列表成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getCategoryList(ctx) {
    try {
      const result = await tiebaService.getCategoryList()
      const electList = await tiebaService.getElectCategory()
      const electObj = {
        id: 1,
        name: '推举',
        children: electList || []
      }
      const hotList = await tiebaService.getHotCategory()
      const hotObj = {
        id: 2,
        name: '热门',
        children: hotList || []
      }
      const data = [electObj, hotObj, ...result]
      ctx.body = {
        status: 200,
        msg: '获取贴吧分类列表成功',
        data
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getSwiperBanner(ctx) {
    try {
      const result = await tiebaService.getSwiperBannerList()
      ctx.body = {
        status: 200,
        msg: '获取轮播图banner列表url成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new TiebaController()