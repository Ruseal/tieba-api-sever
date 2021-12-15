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

  async getRecordLength(userId) {
    const sql = `SELECT * FROM user_record_tieba WHERE user_id=?`
    const [result] = await connection.execute(sql, [userId])
    return result.length
  }

  async isrecord(userId, tiebaId) {
    const sql = `SELECT * FROM user_record_tieba WHERE user_id=? AND tieba_id=?`
    const [result] = await connection.execute(sql, [userId, tiebaId])
    return !!result.length
  }

  async getHistroyRecordLength(userId) {
    const sql = `SELECT * FROM record_histroy WHERE user_id=?`
    const [result] = await connection.execute(sql, [userId])
    return result.length
  }

  async hasHistoryRecord(userId, articleId) {
    const sql = `SELECT * FROM record_histroy WHERE user_id=? AND post_id=?`
    const [result] = await connection.execute(sql, [userId, articleId])
    return !!result.length
  }

  async isSearchHistory(userId, value) {
    const sql = `SELECT COUNT(*) FROM search_history WHERE name = ? AND user_id=? AND removed=0`
    const [result] = await connection.execute(sql, [value, userId])
    return !!result
  }

  async isSearchHistoryAll(value) {
    const sql = `SELECT * FROM search_history WHERE name = ?`
    const [result] = await connection.execute(sql, [value])
    return result[0]
  }

  async isNoticeSelf(selfId, commentId) {
    const sql = `SELECT IF(user_id<=>?,1,0) isSelf,user_id setId  FROM post WHERE id=(SELECT post_id FROM COMMENT WHERE id=?)`
    const [result] = await connection.execute(sql, [selfId, commentId])
    return result[0]
  }

  async isNoticeReplySelf(selfId, commentId) {
    const sql = `
      SELECT 
        IF(c.user_id<=>?,1,0) isSelf,c.user_id setId 
      FROM COMMENT c 
      WHERE c.id=(SELECT comment_reply_id FROM comment WHERE id=?)`
    const [result] = await connection.execute(sql, [selfId, commentId])
    return result[0]
  }
  
  async createNotice(setId) {
    const sql = `INSERT INTO new_notice_status(user_id) VALUES(?)`
    const [result] = await connection.execute(sql, [setId])
    return result
  }
  
  async isValue(setId) {
    const sql = `SELECT IF(COUNT(*),reply,NULL) isValue FROM new_notice_status WHERE user_id=?`
    const [result] = await connection.execute(sql, [setId])
    return result[0].isValue
  }

  async isFocusValue(setId) {
    const sql = `SELECT focus FROM new_notice_status WHERE user_id=?`
    const [result] = await connection.execute(sql, [setId])
    return result[0]
  }


}

module.exports = new AuthService()