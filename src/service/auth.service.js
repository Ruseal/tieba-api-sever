const connection = require('../app/database')

class AuthService {
  async checkAuth(tableName, id, userId) {
    const sql = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?`
    const [result] = await connection.execute(sql, [id, userId])
    return !!result.length
  }

  async isMaxAuthTieba(id, userId) {
    const sql = `SELECT * FROM tieba WHERE id = ? AND maxadmin_user_id = ?`
    const [result] = await connection.execute(sql, [id, userId])
    return !!result.length
  }
}

module.exports = new AuthService()