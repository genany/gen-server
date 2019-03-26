'use strict'
const dayjs = require('dayjs')
const Service = require('../core/base_service')

module.exports = class UserService extends Service {
  async getUser (userName, userPass) {
    const result = await this.app.mysql.select('user', {
      columns: ['id', 'user_name', 'user_nicename', 'user_email', 'user_url'],
      where: { user_name: userName, user_pass: userPass }
    })
    return result.shift()
  }
  async getUserById (id) {
    const result = await this.app.mysql.select('user', {
      columns: ['id', 'user_name', 'user_nicename', 'user_email', 'user_url'],
      where: { id: id }
    })
    return result.shift()
  }
  async getUserByName (userName) {
    const result = await this.app.mysql.select('user', {
      columns: ['id', 'user_name', 'user_nicename', 'user_email', 'user_url'],
      where: { user_name: userName }
    })
    return result.shift()
  }
  async getUserByEmail (user_email) {
    const result = await this.app.mysql.select('user', {
      columns: ['id', 'user_name', 'user_nicename', 'user_email', 'user_url'],
      where: { user_email }
    })
    return result.shift()
  }

  async addUser (data) {
    data.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
    data.updated_at = data.created_at
    const result = await this.app.mysql.insert('user', data)
    return result.affectedRows === 1
  }
}
