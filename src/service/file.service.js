const connection = require('../app/database')


class FileService {
  async uploadUserAvatar(filename, mimetype, size, id) {
    const sql = `INSERT INTO user_avatar (filename,mimetype,size,user_id) VALUES(?,?,?,?)`
    const [result] = await connection.execute(sql, [filename, mimetype, size, id])
    return result
  }

  async getAvatarByuserId(id) {
    const sql = `SELECT * FROM user_avatar WHERE user_id=?`
    const [result] = await connection.execute(sql, [id])
    return result.pop()
  }


  async uploadTiebaAvatar(filename, mimetype, size, id) {
    const sql = `INSERT INTO tieba_avatar (filename,mimetype,size,tieba_id) VALUES(?,?,?,?)`
    const [result] = await connection.execute(sql, [filename, mimetype, size, id])
    return result
  }

  async getAvatarByTiebaId(tiebaId) {
    const sql = `SELECT * FROM tieba_avatar WHERE tieba_id = ?`
    const [result] = await connection.execute(sql, [tiebaId])
    return result.pop()
  }

  async uploadArticlePictrue(filename, mimetype, size, articleId, userId) {
    const sql = `INSERT INTO post_pictrue (filename,mimetype,size,post_id,user_id) VALUES(?,?,?,?,?)`
    await connection.execute(sql, [filename, mimetype, size, articleId, userId])
    return
  }

  async getArticlePictrueByFilename(filename) {
    const sql = `SELECT * FROM post_pictrue WHERE filename = ?`
    const [result] = await connection.execute(sql, [filename])
    return result
  }

  async uploadCommentPictrue(filename, mimetype, size, commentId, userId) {
    const sql = `INSERT INTO comment_pictrue (filename,mimetype,size,comment_id,user_id) VALUES(?,?,?,?,?)`
    await connection.execute(sql, [filename, mimetype, size, commentId, userId])
    return
  }

  async getCommentPictrueByFilename(filename) {
    const sql = `SELECT * FROM comment_pictrue WHERE filename = ?`
    const [result] = await connection.execute(sql, [filename])
    return result
  }
}

module.exports = new FileService()