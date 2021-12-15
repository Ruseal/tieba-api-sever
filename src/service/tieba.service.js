const connection = require('../app/database')
const { LOGIN_STATUS_OBJ, CATEGORY: { focusCount, commentCount, categoryLimit } } = require('../constents/global')

class TiebaService {
  async createTieba(name, indct, userId, categoryId) {
    const sql = `INSERT INTO tieba (name,introduction,create_user_id,category_id) VALUES (?,?,?,?)`
    const [result] = await connection.execute(sql, [name, indct, userId, categoryId])
    return result
  }
  async updateTiebaAvatarUrlBytiebaId(tiebaAvatarUrl, id) {
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

  async getAllTiebaByUserId(userId) {
    const sql = `
      SELECT 
        tfu.tieba_id id,
        tfu.level level,
        JSON_OBJECT('tiebaId',t.id,'tiebaName',t.name,'introduction',t.introduction,'avatar',t.avatar_url) tieba
      FROM tieba_focus_user tfu
      LEFT JOIN tieba t ON t.id=tfu.tieba_id 
      WHERE tfu.user_id = ?`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async getTiebaDetail(tiebaId) {
    const sql = `
      SELECT 
        t.id id,t.name tiebaName,t.introduction introduction, t.avatar_url avatar,
        (SELECT JSON_OBJECT('id',id,'username',username,'nickname',nickname,'avatar',avatar_url) 
        FROM user
        WHERE id=t.maxadmin_user_id) maxAuth,
        (SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id=t.id) focusCount,
        (SELECT (SELECT COUNT(*) FROM COMMENT WHERE post_id IN 
                (SELECT id FROM post WHERE tieba_id=t.id))+
                (SELECT COUNT(*) FROM post WHERE tieba_id=t.id)) commentCount,
        @id:=? yourUserId,
        (SELECT JSON_OBJECT('isFocus',IF(COUNT(*),1,0),'level',level,'exp',exp,'updateTime',updateAt) 
        FROM tieba_focus_user 
        WHERE tieba_id = t.id AND user_id=@id) cardMsg
      FROM tieba t
      WHERE t.id = ?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, tiebaId])
    return result[0]
  }

  async updateSign(tiebaId, level, exp, userId) {
    const sql = `UPDATE tieba_focus_user SET level=?,exp = ? WHERE tieba_id=? AND user_id=?`
    const [result] = await connection.execute(sql, [level, exp, tiebaId, userId])
    return result
  }

  async getArticleList(tiebaId, offset, size) {
    const sql = `
      SELECT 
        p.id id,p.title title,p.text test,p.createAt createTime,p.updateAt updateTime,
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
            'avatar',u.avatar_url,'members',u.members) author,
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
      LEFT JOIN user u ON p.user_id = u.id
      WHERE p.tieba_id=?
      ORDER BY p.updateAt DESC
      LIMIT ?,?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, tiebaId, offset, size])
    return result
  }

  async isTieba(tiebaName) {
    const sql = `SELECT * FROM tieba WHERE NAME=?`
    const [result] = await connection.execute(sql, [tiebaName])
    return !!result.length
  }

  async setMaxAuth(tiebaId, userId) {
    const sql = ` UPDATE tieba SET maxadmin_user_id = ? WHERE id=?`
    const [result] = await connection.execute(sql, [userId, tiebaId])
    return result
  }

  async updateTiebaIntroduction(tiebaId, introduction) {
    const sql = ` UPDATE tieba SET introduction=? WHERE id=?`
    const [result] = await connection.execute(sql, [introduction, tiebaId])
    return result
  }

  async getSingleArticle(articleId) {
    const sql = `
      SELECT 
        p.id id,p.title title,p.text test,p.createAt createTime,p.updateAt updateTime,
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
            'avatar',u.avatar_url,'members',u.members) author,
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
      LEFT JOIN USER u ON p.user_id = u.id
      WHERE p.id=?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, articleId])
    return result[0]
  }

  async getCategoryList() {
    const sql = `
      SELECT    
        c.id id,c.name name,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',t.id,'name',t.name,'avatar',t.avatar_url,'focus',
           (SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id=t.id))) 
        FROM tieba t 
      WHERE t.category_id=c.id) children
      FROM category c
      ORDER BY c.createAt`
    const [result] = await connection.execute(sql)
    return result
  }

  async getHotCategory() {
    const sql = `
      SELECT t.id id,t.name name,t.avatar_url avatar,
        (SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id=t.id) focus
      FROM tieba t
      ORDER BY focus DESC
      LIMIT ?`
    const [result] = await connection.execute(sql, [categoryLimit])
    return result
  }

  async getElectCategory() {
    const sql = `
      SELECT 
        *
      FROM (SELECT 
              t.id id,t.name name,t.avatar_url avatar,(SELECT COUNT(*) 
                     FROM tieba_focus_user WHERE tieba_id=t.id) focus,
              (SELECT (SELECT COUNT(*) FROM comment WHERE post_id IN 
                 (SELECT id FROM post WHERE tieba_id=t.id))+
                 (SELECT COUNT(*) FROM post WHERE tieba_id=t.id)) commentCount
            FROM tieba t
            ) v
      WHERE v.focus>? AND v.commentCount>?
      ORDER BY RAND()
      LIMIT ?`
    const [result] = await connection.execute(sql, [focusCount, commentCount, categoryLimit])
    return result
  }

  async getSwiperBannerList() {
    const sql = `
      SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/pictrue/swiper/banner/',filename)) banner 
      FROM pictrue 
      WHERE NAME='banner'`
    const [result] = await connection.execute(sql)
    return result[0]
  }
}

module.exports = new TiebaService()