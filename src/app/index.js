const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const cors = require('koa2-cors')


const routers = require('../routers')
const errorHandle = require('./error-handle')  //导入错误处理模块

const app = new Koa()

app.use(bodyparser())
app.use(cors({
  origin: function (ctx) {
    return "*";
  },
  exposeHeaders: ['www-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE','PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}))
routers(app)                                //路由入口



app.on('error', errorHandle)                 //监听错误，并处理该错误

module.exports = app