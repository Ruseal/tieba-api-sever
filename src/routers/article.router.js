const Router = require('koa-router')

const {
  verifyAuth,
  verifyPermission
} = require('../middleware/auth.middleware')

const {
  createArticle,
  articleDetail,
  articleList,
  deleteArticle,
  addArticleLike,
  removeArticleLike,
  addStart,
  removeStart,
  articlePictrueUrl
} = require('../controller/article.controller')

const articleRouter = new Router({prefix:'/article'})

articleRouter.post('/:tiebaId/release',verifyAuth,createArticle)
articleRouter.get('/:articleId',articleDetail)
articleRouter.get('/',articleList)
articleRouter.delete('/:postId',verifyAuth,verifyPermission,deleteArticle)
articleRouter.post('/:articleId/like',verifyAuth,addArticleLike)
articleRouter.delete('/:articleId/unlike',verifyAuth,removeArticleLike)
articleRouter.post('/:articleId/start',verifyAuth,addStart)
articleRouter.delete('/:articleId/unstart',verifyAuth,removeStart)
articleRouter.get('/images/:filename',articlePictrueUrl)

module.exports = articleRouter