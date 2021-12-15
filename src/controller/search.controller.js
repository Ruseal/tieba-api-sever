const errorType = require('../constents/error-type-text')
const searchService = require('../service/search.service')
const authService = require('../service/auth.service')
const { similar, removeRepeat, compare } = require('../utils/structure')

class SearchController {
  async getHistory(ctx) {
    try {
      const { id } = ctx.user
      const result = await searchService.getSearchHistory(id)
      ctx.body = {
        status: 200,
        msg: '获取搜索历史记录成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getFoundHistory(ctx) {
    try {
      const result = await searchService.getFoundHistory()
      ctx.body = {
        status: 200,
        msg: '获取搜索发现记录成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getHotSearch(ctx) {
    try {
      const result = await searchService.getHotSearch()
      ctx.body = {
        status: 200,
        msg: '获取热门搜索成功',
        data: result
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getSearchThink(ctx) {
    try {
      const { value } = ctx.query
      const result1 = await searchService.getHistoryThink(value)
      const result2 = await searchService.getUserThink(value)
      const result3 = await searchService.getTiebaThink(value)
      const data = removeRepeat([...result1, ...result2, ...result3], 'name')
      data.forEach(item => {
        item.valueCount = similar(value, item.name)
      })
      data.sort(compare("valueCount"))
      ctx.body = {
        status: 200,
        msg: '获取搜索联想列表成功',
        data
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getSearchList(ctx) {
    try {
      const { value } = ctx.query
      const user = await searchService.getSearchUserList(value)
      const tieba = await searchService.getSearchTiebaList(value)
      ctx.body = {
        status: 200,
        msg: '获取搜索结果列表成功',
        data: {
          user,
          tieba
        }
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async getSearchArticleList(ctx) {
    try {
      const { value, offset, size } = ctx.query
      const article = await searchService.getSearchArticleList(value, offset, size)
      ctx.body = {
        status: 200,
        msg: '获取搜索结果列表成功',
        data: article
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async saveHistory(ctx) {
    try {
      const { id } = ctx.user
      const { value } = ctx.request.body
      const isHistory = await authService.isSearchHistory(id, value)
      const history = await authService.isSearchHistoryAll(value)
      if (isHistory) {
        await searchService.removeHistory(id, value)
      }
      await searchService.addHistory(id, value)
      if (history) {
        await searchService.addHistoryCount(value, history.search_all_count + 1)
      }
      ctx.body = {
        status: 200,
        msg: '保存用户历史记录成功'
      }
    } catch (e) {
      console.log(e);
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async addHotSearchCount(ctx) {
    try {
      const { value } = ctx.request.body
      const history = await authService.isSearchHistoryAll(value)
      if (history) {
        await searchService.addHistoryCount(value, history.search_all_count + 1)
      }
      ctx.body = {
        status: 200,
        msg: '增加未授权用户搜索词热度数量成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }

  async clearSearchHistory(ctx) {
    try {
      const { id } = ctx.user
      await searchService.clearSearchHistory(id)
      ctx.body = {
        status: 200,
        msg: '清空历史记录成功'
      }
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }
}

module.exports = new SearchController()