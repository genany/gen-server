'use strict'

const assert = require('assert')
const dayjs = require('dayjs')
const Service = require('egg').Service

module.exports = class BaseService extends Service {
  constructor (props) {
    super(props)
    this.conn = this.app.mysql
  }

  async info (where, columns) {
    assert(this.tableName, 'tableName is required')
    assert(where, 'where is required')
    assert.ok(
      Object.prototype.toString(where) === '[object Object]',
      'where is Object'
    )
    assert.ok(Object.keys(where).length, 'where less a prop')

    const options = {
      where
    }

    if (columns) {
      options.columns = columns
    }

    const result = await this.conn.select(this.tableName, options)
    return result.shift()
  }

  async list (where, columns) {
    assert(this.tableName, 'tableName is required')
    const options = {}
    if (where) {
      options.where = where
    }
    if (columns) {
      options.columns = columns
    }
    const result = await this.conn.select(this.tableName, options)
    return result
  }
  async page (pageSize, page, where, columns) {
    assert(this.tableName, 'tableName is required')
    const options = {
      limit: pageSize,
      offset: (page - 1) * pageSize
    }
    const countOptions = {}
    if (where) {
      options.where = where
      countOptions.where = where
    }
    if (columns) {
      options.columns = columns
      countOptions.columns = columns
    }

    const data = await this.conn.select(this.tableName, options)

    const total = await this.conn.count(this.tableName, countOptions)
    const pageData = {
      list: data,
      page,
      pageSize,
      total
    }

    return pageData
  }

  async create (data) {
    assert(this.tableName, 'tableName is required')
    data.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
    data.updated_at = data.created_at
    const result = await this.conn.insert(this.tableName, data)
    return result.insertId
  }

  async edit (updateData, whereData) {
    assert(this.tableName, 'tableName is required')
    try {
      updateData.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const result = await this.conn.update(this.tableName, updateData, {
        where: whereData
      })
      return result.affectedRows > 0
    } catch (error) {
      console.log(error)
    }
  }
  async remove (where) {
    assert(this.tableName, 'tableName is required')
    where = { ...where }
    const result = await this.conn.delete(this.tableName, where)
    return true
  }
}
