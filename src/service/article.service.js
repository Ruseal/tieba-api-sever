const connection = require('../app/database')
const { LOGIN_STATUS_OBJ } = require('../constents/global')

class ArticleService {
  async createArticle(title, text, user_id, tiebaId) {
    const sql = `INSERT INTO post (title,text,user_id,tieba_id) VALUES(?,?,?,?)`
    const [result] = await connection.execute(sql, [title, text, user_id, tiebaId])
    return result
  }

  async getArticleDetail(articleId) {
    const sql = `
      SELECT 
        p.id id,p.title title,p.text text,p.createAt createTime,
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
            'avatar',u.avatar_url,'members',u.members) author,
        (SELECT COUNT(*) FROM comment c WHERE c.post_id = p.id) commentCount,
        JSON_OBJECT('id',t.id,'tiebaName',t.name,'tiebaAvatarUrl',t.avatar_url,
	          'focusCount',(SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id = t.id),
	          'contentCount',(SELECT COUNT(*)+(SELECT COUNT(*) FROM post WHERE tieba_id = t.id) 
	              FROM comment WHERE post_id IN (SELECT id FROM post WHERE tieba_id = t.id))
	      ) tieba,
        (SELECT COUNT(*) FROM post_like_user WHERE post_id = p.id) likeCount,
        (SELECT COUNT(*) FROM comment WHERE post_id = p.id) commentCount,
        @id:=? yourUserId,
        (SELECT JSON_OBJECT('id',id,'username',username,'nickname',nickname,'avatar',avatar_url) FROM user WHERE id=@id) yourUser,
        (SELECT IF(COUNT(*) != 0,1,0) FROM post_start_user WHERE post_id = p.id AND user_id = @id) isStart,
        (SELECT IF(COUNT(*) != 0,1,0) FROM post_like_user WHERE post_id = p.id AND user_id = @id) isLike,
        (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/article/images/',filename)) FROM post_pictrue WHERE post_id = p.id) imageList
      FROM post p
      LEFT JOIN user u ON p.user_id = u.id
      LEFT JOIN tieba t ON p.tieba_id = t.id
      WHERE p.id = ?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, articleId])
    return result[0]
  }

  async getArticleList(offset, size) {
    const sql = `
      SELECT 
        p.id id,p.title title,p.text test,p.createAt createTime,
        JSON_OBJECT('id',t.id,'tiebaName',t.name,'tiebaAvatarUrl',t.avatar_url,
	         'focusCount',(SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id = t.id),
	         'contentCount',(SELECT COUNT(*)+(SELECT COUNT(*) FROM post WHERE tieba_id = t.id) 
	             FROM comment WHERE post_id IN (SELECT id FROM post WHERE tieba_id = t.id))
	      ) tieba,
        (SELECT COUNT(*) FROM COMMENT c WHERE c.post_id = p.id) commentCount,
        (SELECT COUNT(*) FROM post_like_user WHERE post_id = p.id) likeCount,
        @id:=? yourUserId,
        (SELECT IF(COUNT(*) != 0,1,0) FROM post_like_user WHERE post_id = p.id AND user_id = @id) isLike,
        (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/article/images/',filename)) FROM post_pictrue WHERE post_id = p.id) imageList
      FROM post p
      LEFT JOIN tieba t ON p.tieba_id = t.id
      LIMIT ?,?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, offset, size])
    return result
  }

  async deleteArticle(articleId) {
    const sql = `DELETE FROM post WHERE id = ?`
    await connection.execute(sql, [articleId])
    return
  }

  async addArticleLike(articleId, userId) {
    const sql = `INSERT INTO post_like_user (post_id,user_id) VALUES (?,?)`
    const [result] = await connection.execute(sql, [articleId, userId])
    return result
  }

  async removeArticleLike(articleId, userId) {
    const sql = `DELETE FROM post_like_user WHERE post_id = ? AND user_id = ?`
    const [result] = await connection.execute(sql, [articleId, userId])
    return result
  }

  async addStart(articleId, userId) {
    const sql = `INSERT INTO post_start_user (post_id,user_id) VALUES (?,?)`
    const [result] = await connection.execute(sql, [articleId, userId])
    return result
  }

  async removeStart(articleId, userId) {
    const sql = `DELETE FROM post_start_user WHERE post_id = ? AND user_id = ?`
    const [result] = await connection.execute(sql, [articleId, userId])
    return result
  }
}

module.exports = new ArticleService()