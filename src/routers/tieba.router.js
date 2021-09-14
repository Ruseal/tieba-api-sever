const Router = require('koa-router')

const {
  verifyAuth
} = require('../middleware/auth.middleware')

const {
  tiebaAvatarInfo,
  focusTieba,
  unFocusTieba
} = require('../controller/tieba.controller')

const tiebaRouter = new Router({ prefix: '/tieba' })

tiebaRouter.get('/:tiebaId/avatar', tiebaAvatarInfo)
tiebaRouter.post('/:tiebaId/focus', verifyAuth, focusTieba)
tiebaRouter.delete('/:tiebaId/unfocus', verifyAuth, unFocusTieba)

module.exports = tiebaRouter