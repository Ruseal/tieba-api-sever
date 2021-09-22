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

  async userMessage(userId) {
    const sql = `
      SELECT id,username,nickname,gender,avatar_url,introduction,members,
             (SELECT JSON_ARRAY(
                (SELECT JSON_OBJECT('count',30,'name','关注')),
                (SELECT JSON_OBJECT('count',129,'name','粉丝')),
                (SELECT JSON_OBJECT('count',16,'name','吧'))
              )) numerical
      FROM USER WHERE id = ?`
    const [result] = await connections.execute(sql, [userId])
    return result[0]
  }

}

module.exports = new UserService()