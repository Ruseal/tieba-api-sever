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
        @id:=? yourUserId,
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
            'avatar',u.avatar_url,'members',u.members,'level',
            (SELECT LEVEL FROM tieba_focus_user WHERE tieba_id=p.tieba_id AND user_id=u.id),
            'isfocus',(SELECT COUNT(*) FROM user_focus_user WHERE user_to_id=u.id AND user_by_id=@id)
            ) author,
        (SELECT COUNT(*) FROM comment c WHERE c.post_id = p.id) commentCount,
        JSON_OBJECT('id',t.id,'tiebaName',t.name,'tiebaAvatarUrl',t.avatar_url,'authId',t.maxadmin_user_id,
	          'focusCount',(SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id = t.id),
	          'contentCount',(SELECT COUNT(*)+(SELECT COUNT(*) FROM post WHERE tieba_id = t.id) 
	              FROM comment WHERE post_id IN (SELECT id FROM post WHERE tieba_id = t.id))
	      ) tieba,
        (SELECT COUNT(*) FROM post_like_user WHERE post_id = p.id) likeCount,
        (SELECT COUNT(*) FROM comment WHERE post_id = p.id) commentCount,
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

  async getArticleList(size, strId, sqlStr) {

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
            (SELECT IF(COUNT(*)!= 0,1,0) FROM post_like_user WHERE post_id = p.id AND user_id = @id) isLike,
            (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/article/images/',filename)) FROM post_pictrue WHERE post_id = p.id) imageList
        FROM post p
        LEFT JOIN tieba t ON p.tieba_id = t.id
        WHERE p.user_id!=${LOGIN_STATUS_OBJ.defaultCreateId[1]} ${sqlStr} AND p.id NOT IN (SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(${strId},',',help_topic_id+1),',',-1) AS col
             FROM mysql.help_topic
             WHERE help_topic_id<(LENGTH(${strId})-LENGTH(REPLACE(${strId},',',''))+1))
        ORDER BY RAND()
        LIMIT ?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, size])
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

  async createArticleByCreateTieba(title, text, tiebaId) {
    const sql = `INSERT INTO post (title,text,user_id,tieba_id) VALUES(?,?,?,?)`
    await connection.execute(sql, [title, text, LOGIN_STATUS_OBJ.defaultCreateId[1], tiebaId])
  }
}

module.exports = new ArticleService()