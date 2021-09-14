// 数据库操作模块

const connections = require('../app/database')

class UserService {
  // 注册新用户
  async createUser(username, password) {
    const sql = `INSERT INTO user (username,password) VALUES(?,?);`
    const [result] = await connections.execute(sql, [username, password])
    return result
  }
  // 验证用户名是否重复
  async isUseByName(username) {
    const sql = `SELECT * FROM user WHERE username=?`
    const [result] = await connections.execute(sql, [username])
    return result
  }

  async updateUserAvatarUrlByuserId(userAvatarUrl, id) {
    const sql = `UPDATE user SET avatar_url = ? WHERE id = ?`
    await connections.execute(sql, [userAvatarUrl, id])
    return

  }
}

module.exports = new UserService()