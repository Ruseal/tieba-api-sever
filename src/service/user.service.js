// 数据库操作模块

const connections = require('../app/database')

class UserService {
  // 注册新用户
  async createUser(name, password) {
    const sql = `INSERT INTO user (name,password) VALUES(?,?);`
    const [result] = await connections.execute(sql, [name, password])
    return result
  }
  // 验证用户名是否重复
  async isUseByName(name) {
    const sql = `SELECT * FROM USER WHERE NAME=?`
    const [result] = await connections.execute(sql, [name])
    return result
  }
}

module.exports = new UserService()