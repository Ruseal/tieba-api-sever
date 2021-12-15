const Router = require('koa-router')

const {
  verifyAuth,
  verifyTiebaAuth
} = require('../middleware/auth.middleware')

const {
  tiebaAvatarInfo,
  focusTieba,
  unFocusTieba,
  tiebaList,
  createTieba,
  getTiebaDeatil,
  signIn,
  articleList,
  applyMaxAuth,
  introduction,
  singleArticle,
  getCategoryList,
  getSwiperBanner
} = require('../controller/tieba.controller')

const tiebaRouter = new Router({ prefix: '/tieba' })

tiebaRouter.post('/', verifyAuth, createTieba)
tiebaRouter.get('/:tiebaId/detail', getTiebaDeatil)
tiebaRouter.get('/:tiebaId/avatar', tiebaAvatarInfo)
tiebaRouter.post('/:tiebaId/focus', verifyAuth, focusTieba)
tiebaRouter.delete('/:tiebaId/unfocus', verifyAuth, unFocusTieba)
tiebaRouter.get('/all', verifyAuth, tiebaList)
tiebaRouter.patch('/:tiebaId/sign', verifyAuth, signIn)
tiebaRouter.get('/:tiebaId/article', articleList)
tiebaRouter.get('/:articleId/single', singleArticle)
tiebaRouter.patch('/:tiebaId/maxauth', verifyAuth, applyMaxAuth)
tiebaRouter.patch('/:tiebaId/introduction', verifyAuth, verifyTiebaAuth, introduction)
tiebaRouter.get('/category', getCategoryList)
tiebaRouter.get('/swiper/banner', getSwiperBanner)

module.exports = tiebaRouter