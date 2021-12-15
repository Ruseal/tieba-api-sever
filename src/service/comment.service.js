const connection = require('../app/database')
const { LOGIN_STATUS_OBJ } = require('../constents/global')

class CommentService {
  async createComment(content, userId, articleId,) {
    const sql = `INSERT INTO comment (content,user_id,post_id) VALUES(?,?,?)`
    const [result] = await connection.execute(sql, [content, userId, articleId])
    return result
  }

  async createReply(content, articleId, commentId, commentReplyId, userId) {
    const sql = `INSERT INTO comment (content,user_id,post_id,comment_id,comment_reply_id) VALUES(?,?,?,?,?)`
    const [result] = await connection.execute(sql, [content, userId, articleId, commentId, commentReplyId])
    return result
  }

  async deleteComment(commentId) {
    const sql = `DELETE FROM comment WHERE id = ?`
    const result = await connection.execute(sql, [commentId])
    return result
  }

  async getCommentListByArticleId(articleId, offset, size) {
    const sql = `
      SELECT 
        c.id id,c.content content,c.createAt createTime,
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
            'avatar',u.avatar_url,'members',u.members,'level',
            (SELECT level FROM tieba_focus_user WHERE tieba_id=(
                                   SELECT tieba_id FROM post WHERE c.post_id= id) AND user_id=u.id) 
             ) author,
        (SELECT COUNT(*) FROM COMMENT c1 
        INNER JOIN COMMENT c2 ON c1.comment_id = c2.id 
        WHERE c1.comment_id = c.id) replyCount,
        (SELECT COUNT(*) FROM comment_like_user WHERE comment_id = c.id) likeCount,
        @id:=? yourUserId,
        (SELECT (SELECT maxadmin_user_id FROM tieba WHERE id=p.tieba_id) FROM post p WHERE id=c.post_id) tiebaAuthId,
        (SELECT IF(COUNT(*) != 0,1,0) FROM comment_like_user WHERE comment_id = c.id AND user_id = @id) isLike,
        (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/comment/images/',filename)) FROM comment_pictrue WHERE comment_id = c.id) imageList
      FROM comment c
      LEFT JOIN USER u ON c.user_id = u.id 
      WHERE post_id = ? AND comment_id IS NULL
      LIMIT ?,?`

    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, articleId, offset, size])
    return result


  }

  async getReplyListByCommentId(commentId) {
    const sql = `
      SELECT 
        c.id id,c.content content,c.createAt createTime, 
        JSON_OBJECT('id',u.id,'username',u.username,'nickname',u.nickname,
                   'avatar',u.avatar_url,'members',u.members ) author,
        (SELECT COUNT(*) FROM comment_like_user WHERE comment_id = c.id) likeCount,
        @id:=? yourUserId,
        (SELECT IF(COUNT(*) != 0,1,0) FROM comment_like_user WHERE comment_id = c.id AND user_id = @id) isLike,
        c.comment_id toComment,
        ((SELECT 
            JSON_OBJECT('replyCommentId',IF(toComment!=cr.id,cr.id,NULL),'toReplyUserId',ur.id,
            'toReplyUserName',ur.username,'toReplyNickName',ur.nickname
            ) 
         FROM comment cr
         LEFT JOIN user ur ON cr.user_id=ur.id
         WHERE cr.id=c.comment_reply_id)
         ) toReply
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id 
      WHERE c.comment_id = ? AND c.comment_id IS NOT NULL`

    const [result] = await connection.execute(sql, [LOGIN_STATUS_OBJ.userId, commentId])
    return result
  }

  async addCommentLike(commentId, userId) {
    const sql = `INSERT INTO comment_like_user (comment_id,user_id) VALUES (?,?)`
    const [result] = await connection.execute(sql, [commentId, userId])
    return result
  }

  async removeCommentLike(commentId, userId) {
    const sql = `DELETE FROM comment_like_user WHERE comment_id = ? AND user_id = ?`
    const [result] = await connection.execute(sql, [commentId, userId])
    return result
  }

  async getUserReply(userId) {
    const sql = `
      SELECT 
        c.id id,c.content content,c.createAt createTime,
        (SELECT JSON_OBJECT('id',id,'name',IF(nickname!=NULL,nickname,username),'avatar',avatar_url) 
            FROM USER WHERE id=c.user_id) author,
        (SELECT JSON_OBJECT('id',id,'text',text,'title',title) FROM post WHERE id=c.post_id) article,
        (SELECT JSON_OBJECT('name',name,'avatar',avatar_url) FROM tieba WHERE id=(SELECT tieba_id FROM post WHERE id = (SELECT post_id FROM comment WHERE id=141))) tieba
      FROM comment c
      WHERE c.post_id IN (SELECT id FROM post WHERE user_id=?) AND c.user_id !=?
      ORDER BY c.createAt DESC`
    const [result] = await connection.execute(sql, [userId, userId])
    return result
  }

  async addNoticeCount(count, setId) {
    const sql = `UPDATE new_notice_status SET reply = ? WHERE user_id=?`
    const [result] = await connection.execute(sql, [count, setId])
    return result
  }

  async getBadge(userId) {
    const sql = `SELECT reply,focus FROM new_notice_status WHERE user_id =?`
    const [result] = await connection.execute(sql, [userId])
    return result.pop()
  }

  async clearBadge(userId,type) {
    const sql = `UPDATE new_notice_status SET ${type} = 0 WHERE user_id=?`
    const [result] = await connection.execute(sql, [userId])
    return result
  }
}

module.exports = new CommentService()