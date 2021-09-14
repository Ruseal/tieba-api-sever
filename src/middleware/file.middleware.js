const Multer = require('koa-multer')

const {
  USER_AVATAR_PATH,
  TIEBA_AVATAR_PATH,
  ARTICLE_PICTRUE_PATH,
  COMMENT_PICTRUE_PATH
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

const userAvatarHandle = userAvatarUpload.single('userAvatar')
const tiebaAvatarHandle = tiebaAvatarUpload.single('tiebaAvatar')
const articlePictrueHandle = articlePictrueUpload.array('articlePictrue', 10)
const commentPictrueHandle = commentPictrueUpload.array('commentPictrue', 10)
// const pictureResize = async (ctx, next) => {
//   try {
//     const files = ctx.req.files
//     for (let file of files) {
//       const destPath = path.join(file.destination, file.filename)
//       Jimp.read(file.path).then(image => {
//         image.resize(1280, Jimp.AUTO).write(`${destPath}-large`)
//         image.resize(640, Jimp.AUTO).write(`${destPath}-middle`)
//         image.resize(320, Jimp.AUTO).write(`${destPath}-small`)
//       })
//     }
//     await next()
//   } catch (error) {
//     console.log(error);
//   }
// }

module.exports = {
  userAvatarHandle,
  tiebaAvatarHandle,
  articlePictrueHandle,
  commentPictrueHandle
  // pictureResize
}