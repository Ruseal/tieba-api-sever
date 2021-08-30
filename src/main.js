// 程序入口

require('./app/database')    
const app = require('./app')
const config = require('./app/config')

app.listen(config.APP_PORT, () => {
  console.log(`启动端口${config.APP_PORT}服务器成功`);
})