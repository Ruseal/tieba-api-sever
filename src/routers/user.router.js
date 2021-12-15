const Router = require('koa-router')

//验证处理层导入
const {
  verifyRegister,
  encryptedPassword,
  verifyLogin
} = require('../middleware/user.middleware')
const {
  verifyAuth
} = require('../middleware/auth.middleware')
//逻辑操作层导入
const {
  register,
  login,
  token,
  userAvatarInfo,
  removeLoginStatus,
  getUserMessage,
  userRecordTieba,
  getRecordList,
  isLogin,
  focusUser,
  unFocusUser,
  getUserDetail,
  labelObjList,
  updateUser,
  getUserStar,
  recordHistory,
  getRecordHistory,
  clearUserHistory,
  openMember
} = require('../controller/user.controller')


const userRouter = new Router({ prefix: '/user' })   //创建路由实例，并且定义路由前缀地址

userRouter.post('/register', verifyRegister, encryptedPassword, register)
userRouter.post('/login', verifyLogin, login)
userRouter.post('/token', verifyAuth, token)
userRouter.get('/:userId/avatar', userAvatarInfo)  //查询用户头像地址的接口路由
userRouter.get('/exitLogin', removeLoginStatus)
userRouter.get('/message', verifyAuth, getUserMessage)
userRouter.post('/:tiebaId/record', verifyAuth, userRecordTieba)
userRouter.get('/recordlist', verifyAuth, getRecordList)
userRouter.get('/islogin', verifyAuth, isLogin)
userRouter.post('/focus', verifyAuth, focusUser)
userRouter.delete('/unfocus', verifyAuth, unFocusUser)
userRouter.get('/:userId/detail', getUserDetail)
userRouter.get('/:userId/labellist', labelObjList)
userRouter.patch('/update', verifyAuth, updateUser)
userRouter.get('/star', verifyAuth, getUserStar)
userRouter.post('/history', verifyAuth, recordHistory)
userRouter.get('/history', verifyAuth, getRecordHistory)
userRouter.delete('/history', verifyAuth, clearUserHistory)
userRouter.patch('/member', verifyAuth, openMember)

module.exports = userRouter