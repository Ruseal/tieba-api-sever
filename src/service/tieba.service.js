const connection = require('../app/database')

class TiebaService {
  async updateUserAvatarUrlBytiebaId(tiebaAvatarUrl, id) {
    const sql = `UPDATE tieba SET avatar_url = ? WHERE id = ?`
    await connection.execute(sql, [tiebaAvatarUrl, id])
    return

  }

  async tiebaFocus(tiebaId, userId) {
    const sql = `INSERT INTO tieba_focus_user (tieba_id,user_id) VALUES (?,?)`
    await connection.execute(sql, [tiebaId, userId])
    return
  }

  async tiebaUnFocus(tiebaId, userId) {
    const sql = `DELETE FROM tieba_focus_user WHERE tieba_id = ? AND user_id = ?`
    await connection.execute(sql, [tiebaId, userId])
    return
  }
}

module.exports = new TiebaService()