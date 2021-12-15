const Router = require('koa-router')

const {
  verifyAuth
} = require('../middleware/auth.middleware')

const {
  getHistory,
  getFoundHistory,
  getHotSearch,
  getSearchThink,
  getSearchList,
  getSearchArticleList,
  saveHistory,
  addHotSearchCount,
  clearSearchHistory
} = require('../controller/search.controller')

const searchRouter = new Router({ prefix: '/search' })

searchRouter.get('/history', verifyAuth, getHistory)
searchRouter.get('/found', getFoundHistory)
searchRouter.get('/hot', getHotSearch)
searchRouter.get('/think', getSearchThink)
searchRouter.get('/list', getSearchList)
searchRouter.get('/list/article', getSearchArticleList)
searchRouter.post('/save', verifyAuth, saveHistory)
searchRouter.patch('/count', addHotSearchCount)
searchRouter.delete('/clear', verifyAuth, clearSearchHistory)

module.exports = searchRouter