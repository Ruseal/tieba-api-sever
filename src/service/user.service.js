// 数据库操作模块

const connection = require('../app/database')
const { LOGIN_STATUS_OBJ } = require('../constents/global')

class UserService {
  // 注册新用户
  async createUser(username, password) {

    const sql = `INSERT INTO user (username,password) VALUES(?,?);`

    const [result] = await connection.execute(sql, [username, password])
    return result
  }
  // 验证用户名是否重复
  async isUseByName(username) {
    const sql = `SELECT * FROM user WHERE username=?`
    const [result] = await connection.execute(sql, [username])
    return result
  }

  async updateUserAvatarUrlByuserId(userAvatarUrl, id) {
    const sql = `UPDATE user SET avatar_url = ? WHERE id = ?`
    await connection.execute(sql, [userAvatarUrl, id])
    return
  }

  async userMessage(userId) {
    const sql = `
      SELECT u.id id,u.username username,u.nickname nickname,u.gender gender,u.avatar_url avatar,u.introduction indt,
            u.members member,
        (SELECT JSON_ARRAY(
          (SELECT JSON_OBJECT('count',COUNT(*),'name','关注','type','focus') FROM user_focus_user WHERE user_by_id=u.id),
          (SELECT JSON_OBJECT('count',COUNT(*),'name','粉丝','type','fans') FROM user_focus_user WHERE user_to_id=u.id),
          (SELECT JSON_OBJECT('count',COUNT(*),'name','吧','type','tieba') FROM tieba_focus_user WHERE user_id=u.id)
        )) numerical
      FROM USER u WHERE u.id = ?`
    const [result] = await connection.execute(sql, [userId])
    return result[0]
  }

  async deleteCurrentRecord(userId, tiebaId) {
    const sql = `DELETE FROM user_record_tieba WHERE user_id=? AND tieba_id=?`
    const [result] = await connection.execute(sql, [userId, tiebaId])
    return result
  }

  async addCurrentRecord(userId, tiebaId) {
    const sql = `INSERT INTO user_record_tieba (tieba_id,user_id) VALUES (?,?)`
    const [result] = await connection.execute(sql, [tiebaId, userId])
    return result
  }

  async deleteFirstRecord(userId) {
    const sql = `DELETE FROM user_record_tieba WHERE user_id=? ORDER BY createAt LIMIT 1`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async getRecordListByUserId(userId) {
    const sql = `
      SELECT 
        t.id id, t.name tiebaName,t.avatar_url avatar,
        (SELECT COUNT(*) FROM tieba_focus_user WHERE tieba_id=t.id) focusCount,
        (SELECT level FROM tieba_focus_user WHERE user_id=urt.user_id AND tieba_id=t.id) level
      FROM user_record_tieba urt
      LEFT JOIN tieba t ON t.id=urt.tieba_id 
      WHERE urt.user_id=? ORDER BY urt.createAt DESC`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async focusUserByUserId(userId, focusId) {
    const sql = `INSERT INTO user_focus_user (user_by_id,user_to_id) VALUES (?,?)`
    const [result] = await connection.execute(sql, [userId, focusId])
    return result
  }

  async unFocusUserByUserId(userId, focusId) {
    const sql = `DELETE FROM user_focus_user WHERE user_by_id=? AND user_to_id=?`
    const [result] = await connection.execute(sql, [userId, focusId])
    return result
  }

  async getUserDetail(userId) {
    const sql = `
      SELECT u.id id,u.username username,u.nickname nickname,u.avatar_url avatar,
          u.gender gender,u.introduction introduction,u.members member,u.createAt createTime,
          @id:=? yourUserId,
          (SELECT IF(u.id<=>@id,1,0)) isSelf,
          (SELECT IF(COUNT(*) != 0,1,0) FROM user_focus_user WHERE user_by_id=@id AND user_to_id=u.id) isFocusUser,
          (SELECT (SELECT COUNT(*) FROM post_like_user WHERE post_id IN (SELECT id FROM post WHERE user_id=u.id))+
          (SELECT COUNT(*) FROM comment_like_user WHERE comment_id IN (SELECT id FROM comment WHERE user_id=u.id))) likeCount,
          (SELECT COUNT(*) FROM user_focus_user WHERE user_by_id = u.id) focusCount,
          (SELECT COUNT(*) FROM user_focus_user WHERE user_to_id = u.id) fansCount,
          (SELECT COUNT(*) FROM tieba_focus_user WHERE user_id=u.id) tiebaCount
      FROM user u
      WHERE u.id=?`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, userId])
    return result[0]
  }

  async getUserDeatilList(userId) {
    const sql = `
      SELECT 
        p.id id,p.title title,p.text test,p.createAt createTime,p.updateAt updateTime,
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
          'avatar',u.avatar_url,'member',u.members) author,
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
      WHERE p.user_id=?
      ORDER BY p.updateAt DESC`
    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, userId])
    return result
  }

  async getFocusList(userId) {
    const sql = `
      SELECT id,IF(nickname!=NULL,nickname,username) name,introduction indt,avatar_url avatar
      FROM USER WHERE id IN (SELECT user_to_id FROM user_focus_user WHERE user_by_id=?)`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async getFansList(userId) {
    const sql = `
      SELECT u.id id,IF(u.nickname!=NULL,u.nickname,u.username) name,u.introduction indt,u.avatar_url avatar,
        (SELECT COUNT(*) FROM user_focus_user WHERE user_by_id=u.id AND user_to_id=?) isfocus
      FROM USER u WHERE u.id IN (SELECT ufu.user_by_id FROM user_focus_user ufu WHERE ufu.user_to_id=?)`
    const [result] = await connection.execute(sql, [userId, userId])
    return result
  }

  async getTiebaList(userId) {
    const sql = `
    SELECT id,name,introduction indt,avatar_url avatar 
    FROM tieba WHERE id IN (SELECT tieba_id FROM tieba_focus_user WHERE user_id=?)`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async updateUserMsg(userId, nickname, gender, message) {
    const sql = `UPDATE USER SET nickname=?,gender=?,introduction=? WHERE id=?`
    const [result] = await connection.execute(sql, [nickname, gender, message, userId])
    return result
  }

  async getUserStar(userId) {
    const sql = `
      SELECT p.id id,p.title title,p.text text,p.createAt createTime,p.updateAt updateTime,
         @id:=? yourUserId,
         JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,'avatar',u.avatar_url,
              'isfocus',(SELECT COUNT(*) FROM user_focus_user WHERE user_by_id=@id AND user_to_id=u.id),
              'isSelfArticle',IF(u.id!=@id,0,1)
          ) author,
         JSON_OBJECT('id',t.id,'tiebaName',t.name,'tiebaAvatarUrl',t.avatar_url,'authId',t.maxadmin_user_id) tieba,
         (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/article/images/',filename)) FROM post_pictrue WHERE post_id = p.id) imageList
      FROM post p 
      LEFT JOIN user u ON p.user_id = u.id
      LEFT JOIN tieba t ON p.tieba_id = t.id
      WHERE p.id IN (SELECT post_id FROM post_start_user WHERE user_id=? ORDER BY createAt DESC)
    `
    const [result] = await connection.execute(sql, [userId, userId])
    return result
  }

  async deleteCurrentHistoryRecord(userId, articleId) {
    const sql = `DELETE FROM record_histroy WHERE user_id=? AND post_id=?`
    const [result] = await connection.execute(sql, [userId, articleId])
    return result
  }

  async addCurrentHistoryRecord(userId, articleId) {
    const sql = `INSERT INTO record_histroy (post_id,user_id) VALUES (?,?)`
    const [result] = await connection.execute(sql, [articleId, userId])
    return result
  }

  async deleteFirstHistoryRecord(userId) {
    const sql = `DELETE FROM record_histroy WHERE user_id=? ORDER BY createAt LIMIT 1`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async getRecordHistory(userId) {
    const sql = `
      SELECT p.id id,p.title title,p.text TEXT,t.id tiebaId,t.name tiebaName,
        t.avatar_url avatar,rh.createAt createTime FROM post p
      RIGHT JOIN record_histroy rh ON p.id=rh.post_id
      LEFT JOIN tieba t ON p.tieba_id = t.id
      WHERE rh.user_id=?
      ORDER BY rh.createAt DESC`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async deleteUserHistory(userId) {
    const sql = `DELETE FROM record_histroy WHERE user_id=?`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async openMember(userId) {
    const sql = `UPDATE user SET members = 1 WHERE id=?`
    const [result] = await connection.execute(sql, [userId])
    return result
  }

  async addNoticeFocusCount(count, userId) {
    const sql = `UPDATE new_notice_status SET focus = ? WHERE user_id=?`
    const [result] = await connection.execute(sql, [count, userId])
    return result
  }
}

module.exports = new UserService()