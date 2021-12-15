const Router = require('koa-router')

const {
  getSwiperBanner
} = require('../controller/pictrue.controller')

const pictrueRouter = new Router({ prefix: '/pictrue' })

pictrueRouter.get('/swiper/banner/:filename', getSwiperBanner)

module.exports = pictrueRouter