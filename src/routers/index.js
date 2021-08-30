// 遍历目录下所有除index.js的文件，并逐一对每一个路由文件进行操作

const fs = require('fs')

const routers = (app) => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') return
    const routeFile = require(`./${file}`)
    app.use(routeFile.routes())
    app.use(routeFile.allowedMethods())    //注册识别一些不常见到的请求方式
  })
}

module.exports = routers