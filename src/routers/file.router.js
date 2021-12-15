const Router = require('koa-router')

const {
  verifyAuth,
  verifyTiebaAuth,
  verifyAdminAuth
} = require('../middleware/auth.middleware')

const {
  userAvatarHandle,
  tiebaAvatarHandle,
  articlePictrueHandle,
  commentPictrueHandle,
  bannerHandle
} = require("../middleware/file.middleware")

const {
  saveUserAvatar,
  saveTiebaAvatar,
  saveArticlePictrue,
  saveCommentPictrue,
  saveBanner
} = require("../controller/file.controller")

const fileRouter = new Router({ prefix: '/upload' })

fileRouter.post('/userAvatar', verifyAuth, userAvatarHandle, saveUserAvatar) //上传用户头像接口路由
fileRouter.post('/:tiebaId/tiebaAvatar', verifyAuth, verifyTiebaAuth, tiebaAvatarHandle, saveTiebaAvatar)
fileRouter.post('/articlePictrue', verifyAuth, articlePictrueHandle, saveArticlePictrue)
fileRouter.post('/commentPictrue', verifyAuth, commentPictrueHandle, saveCommentPictrue)
fileRouter.post('/banner', verifyAuth, verifyAdminAuth, bannerHandle, saveBanner)




module.exports = fileRouter