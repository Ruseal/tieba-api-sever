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
  getUserMessage
} = require('../controller/user.controller')


const userRouter = new Router({ prefix: '/user' })   //创建路由实例，并且定义路由前缀地址

userRouter.post('/register', verifyRegister, encryptedPassword, register)
userRouter.post('/login', verifyLogin, login)
userRouter.post('/token', verifyAuth, token)
userRouter.get('/:userId/avatar', userAvatarInfo)  //查询用户头像地址的接口路由
userRouter.get('/exitLogin', removeLoginStatus)
userRouter.get('/message', verifyAuth, getUserMessage)

module.exports = userRouter