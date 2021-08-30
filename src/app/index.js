const Koa = require('koa')
const bodyparser = require('koa-bodyparser')

const routers = require('../routers')
const errorHandle = require('./error-handle')  //导入错误处理模块

const app = new Koa()

app.use(bodyparser())
routers(app)                                //路由入口

app.on('error',errorHandle)                 //监听错误，并处理该错误

module.exports = app