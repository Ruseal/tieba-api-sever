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
  commentPictrueUrl,
  userReply,
  getBadge,
  clearBadge
} = require('../controller/comment.controller')


const commentRouter = new Router({ prefix: '/comment' })

commentRouter.post('/', verifyAuth, createComment)
commentRouter.post('/:commentReplyId/reply', verifyAuth, createReply)
commentRouter.delete('/:commentId', verifyAuth, verifyPermission,deleteComment)
commentRouter.get('/',commentList)
commentRouter.get('/:commentId/reply',replyList)
commentRouter.post('/:commentId/like',verifyAuth,addCommentLike)
commentRouter.delete('/:commentId/unlike',verifyAuth,removeCommentLike)
commentRouter.get('/images/:filename',commentPictrueUrl)
commentRouter.get('/userreply',verifyAuth,userReply)
commentRouter.get('/badge',verifyAuth,getBadge)
commentRouter.patch('/clear/badge',verifyAuth,clearBadge)

module.exports = commentRouter