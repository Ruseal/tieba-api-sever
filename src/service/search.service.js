const connection = require('../app/database')
const { SEARCH: { number, limitFound, limitHot, limitThink, limitList },
  LOGIN_STATUS_OBJ
} = require('../constents/global')

class SearchService {
  async getSearchHistory(id) {
    const sql = `SELECT id,name FROM search_history WHERE user_id = ? AND removed = 0 ORDER BY createAt DESC`
    const [result] = await connection.execute(sql, [id])
    return result
  }

  async getFoundHistory() {
    const sql = `SELECT id,name FROM search_history WHERE search_all_count>? GROUP BY name ORDER BY RAND() LIMIT ?`
    const [result] = await connection.execute(sql, [number, limitFound])
    return result
  }

  async getHotSearch() {
    const sql = `SELECT id,name,search_all_count hot FROM search_history GROUP BY name ORDER BY search_all_count DESC LIMIT ?`
    const [result] = await connection.execute(sql, [limitHot])
    return result
  }

  async getHistoryThink(value) {
    const sql = `
      SELECT 
        id,name,'history' type
      FROM search_history 
      WHERE name LIKE CONCAT('%',?,'%') AND search_all_count>?
      ORDER BY REPLACE(name,?,'') 
      LIMIT ?`
    const [result] = await connection.execute(sql, [value, number, value, limitThink])
    return result
  }

  async getUserThink(value) {
    const sql = `
      SELECT
        *
      FROM (SELECT 
              IF(nickname<=>NULL,username,nickname) name,
              'user' type
            FROM user) vu
      WHERE vu.name LIKE CONCAT('%',?,'%') 
      ORDER BY REPLACE(vu.name,?,'')
      LIMIT ?`
    const [result] = await connection.execute(sql, [value, value, limitThink])
    return result
  }

  async getTiebaThink(value) {
    const sql = `
      SELECT 
        name,
        'tieba' type
      FROM tieba
      WHERE name LIKE CONCAT('%',?,'%') 
      ORDER BY REPLACE(name,?,'')
      LIMIT ?`
    const [result] = await connection.execute(sql, [value, value, limitThink])
    return result
  }

  async getSearchUserList(value) {
    const sql = `
      SELECT * FROM (SELECT 
              u.id id,u.avatar_url avatar_url,
              (SELECT COUNT(*) FROM user_focus_user WHERE user_to_id=u.id) focus,
              IF(u.nickname<=>NULL,u.username,u.nickname) name,
              'user' type
          FROM user u) vu
      WHERE vu.name LIKE CONCAT('%',?,'%') 
      ORDER BY REPLACE(vu.name,?,'')
      LIMIT ?`
    const [result] = await connection.execute(sql, [value, value, limitList])
    return result
  }

  async getSearchTiebaList(value) {
    const sql = `
      SELECT 
        *,
        (SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id=t.id) focusCount,
        (SELECT (SELECT COUNT(*) FROM COMMENT WHERE post_id IN 
              (SELECT id FROM post WHERE tieba_id=t.id))+
              (SELECT COUNT(*) FROM post WHERE tieba_id=t.id)) commentCount,
        'tieba' type
      FROM tieba t
      WHERE t.name LIKE CONCAT('%',?,'%') 
      ORDER BY REPLACE(t.name,?,'')
      LIMIT ?`
    const [result] = await connection.execute(sql, [value, value, limitList])
    return result
  }

  async getSearchArticleList(value, offset, size) {
    const sql = `
      SELECT 
        p.id id,p.title title,p.text test,p.createAt createTime,
        JSON_OBJECT('id',t.id,'tiebaName',t.name,'tiebaAvatarUrl',t.avatar_url,
            'focusCount',(SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id = t.id),
            'contentCount',(SELECT COUNT(*)+(SELECT COUNT(*) FROM post WHERE tieba_id = t.id) 
                  FROM COMMENT WHERE post_id IN (SELECT id FROM post WHERE tieba_id = t.id))
            ) tieba,
        (SELECT COUNT(*) FROM COMMENT c WHERE c.post_id = p.id) commentCount,
        (SELECT COUNT(*) FROM post_like_user WHERE post_id = p.id) likeCount,
        @id:=? yourUserId,
        (SELECT IF(COUNT(*) != 0,1,0) FROM post_like_user WHERE post_id = p.id AND user_id = @id) isLike,
        (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/article/images/',filename)) FROM post_pictrue WHERE post_id = p.id) imageList
      FROM post p
      LEFT JOIN tieba t ON p.tieba_id = t.id
      WHERE p.user_id!=1 AND (title LIKE CONCAT('%',?,'%') OR text LIKE CONCAT('%',?,'%'))
      ORDER BY REPLACE(title OR text,?,'')
      LIMIT ?,?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, value, value, value, offset, size])
    return result
  }

  async removeHistory(userId, value) {
    const sql = `DELETE FROM search_history WHERE NAME = ? AND user_id = ? AND removed=0`
    const [result] = await connection.execute(sql, [value, userId])
    return result
  }

  async addHistory(userId, value) {
    const sql = `INSERT INTO search_history (name,user_id) VALUES(?,?)`
    const [result] = await connection.execute(sql, [value, userId])
    return result
  }

  async addHistoryCount(value, count) {
    const sql = `UPDATE search_history SET search_all_count = ? WHERE name = ?`
    const [result] = await connection.execute(sql, [count, value])
    return result
  }

  async clearSearchHistory(userId, value) {
    const sql = `UPDATE search_history SET removed = 1 WHERE removed = 0 AND user_id = ?`
    const [result] = await connection.execute(sql, [userId])
    return result
  }
}

module.exports = new SearchService()