const connection = require('../app/database')

class PictrueService {
  async getSwiperBanner(filename) {
    const sql = `
      SELECT * FROM pictrue WHERE filename = ?`
    const [result] = await connection.execute(sql, [filename])
    return result.pop()
  }
}

module.exports = new PictrueService()