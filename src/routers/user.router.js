const Router = require('koa-router')

//验证处理层导入
const {
  verifyRegister,
  encryptedPassword,
  verifyLogin
} = require('../middleware/user.middleware')
//逻辑操作层导入
const {
  register,
  login
} = require('../controller/user.controller')


const userRouter = new Router({ prefix: '/user' })   //创建路由实例，并且定义路由前缀地址

userRouter.post('/register', verifyRegister, encryptedPassword, register)
userRouter.post('login',verifyLogin,login)

module.exports = userRouter