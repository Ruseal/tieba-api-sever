const fs = require('fs')

const errorType = require('../constents/error-type-text')
const pictrueService = require('../service/pictrue.service')
const { SWIPER_PATH } = require('../constents/file.path')

class PictrueController {
  async getSwiperBanner(ctx) {
    try {
      const { filename } = ctx.params
      const bannerInfo = await pictrueService.getSwiperBanner(filename)
      ctx.response.set('content-type', bannerInfo.mimetype)            //另浏览器识别该文件为图片，否则当做文件直接下载下来
      ctx.body = fs.createReadStream(`${SWIPER_PATH}/${filename}`)
    } catch (e) {
      const error = new Error(errorType.SERVER_ERROR)
      return ctx.app.emit('error', error, ctx)
    }
  }


}

module.exports = new PictrueController()