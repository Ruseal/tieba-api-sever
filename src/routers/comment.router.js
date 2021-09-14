const Router = require('koa-router')

const {
  verifyAuth,
  verifyPermission
} = require('../middleware/auth.middleware')

const {
  createComment,
  createReply,
  deleteComment,
  commentList,
  replyList,
  addCommentLike,
  removeCommentLike,
  commentPictrueUrl
} = require('../controller/comment.controller')


const commentRouter = new Router({ prefix: '/comment' })

commentRouter.post('/', verifyAuth, createComment)
commentRouter.post('/:commentId/reply', verifyAuth, createReply)
commentRouter.delete('/:commentId', verifyAuth, verifyPermission,deleteComment)
commentRouter.get('/',commentList)
commentRouter.get('/:commentId/reply',replyList)
commentRouter.post('/:commentId/like',verifyAuth,addCommentLike)
commentRouter.delete('/:commentId/unlike',verifyAuth,removeCommentLike)
commentRouter.get('/images/:filename',commentPictrueUrl)

module.exports = commentRouter