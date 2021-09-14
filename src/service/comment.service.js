const connection = require('../app/database')
const { loginStatusObj } = require('../constents/global')

class CommentService {
  async createComment(content, userId, articleId,) {
    const sql = `INSERT INTO comment (content,user_id,post_id) VALUES(?,?,?)`
    const [result] = await connection.execute(sql, [content, userId, articleId])
    return result
  }

  async createReply(content, userId, articleId, commentId) {
    const sql = `INSERT INTO comment (content,user_id,post_id,comment_id) VALUES(?,?,?,?)`
    const [result] = await connection.execute(sql, [content, userId, articleId, commentId])
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
            'avatar',u.avatar_url,'members',u.members ) author,
        (SELECT COUNT(*) FROM COMMENT c1 
        INNER JOIN COMMENT c2 ON c1.comment_id = c2.id 
        WHERE c1.comment_id = c.id) replyCount,
        (SELECT COUNT(*) FROM comment_like_user WHERE comment_id = c.id) likeCount,
        @id:=? yourUserId,
        (SELECT IF(COUNT(*) != 0,1,0) FROM comment_like_user WHERE comment_id = c.id AND user_id = @id) isLike,
        (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8000/comment/images/',filename)) FROM comment_pictrue WHERE comment_id = c.id) imageList
      FROM comment c
      LEFT JOIN USER u ON c.user_id = u.id 
      WHERE post_id = ? AND comment_id IS NULL
      LIMIT ?,?`
    const [result] = await connection.execute(sql, [loginStatusObj.userId, articleId, offset, size])
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
        (SELECT IF(COUNT(*) != 0,1,0) FROM comment_like_user WHERE comment_id = c.id AND user_id = @id) isLike
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id 
      WHERE c.comment_id = ? AND c.comment_id IS NOT NULL
    `
    const [result] = await connection.execute(sql, [loginStatusObj.userId, commentId])
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
}

module.exports = new CommentService()