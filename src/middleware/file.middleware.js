const Multer = require('koa-multer')

const {
  USER_AVATAR_PATH,
  TIEBA_AVATAR_PATH,
  ARTICLE_PICTRUE_PATH,
  COMMENT_PICTRUE_PATH,

  SWIPER_PATH
} = require('../constents/file.path')

const userAvatarUpload = Multer({
  dest: USER_AVATAR_PATH
})
const tiebaAvatarUpload = Multer({
  dest: TIEBA_AVATAR_PATH
})
const articlePictrueUpload = Multer({
  dest: ARTICLE_PICTRUE_PATH
})
const commentPictrueUpload = Multer({
  dest: COMMENT_PICTRUE_PATH
})
const bannerUpload = Multer({
  dest: SWIPER_PATH
})

const userAvatarHandle = userAvatarUpload.single('userAvatar')
const tiebaAvatarHandle = tiebaAvatarUpload.single('tiebaAvatar')
const articlePictrueHandle = articlePictrueUpload.array('articlePictrue', 10)
const commentPictrueHandle = commentPictrueUpload.array('commentPictrue', 10)
const bannerHandle = bannerUpload.array('bannerPictrue', 30)

module.exports = {
  userAvatarHandle,
  tiebaAvatarHandle,
  articlePictrueHandle,
  commentPictrueHandle,

  bannerHandle
}