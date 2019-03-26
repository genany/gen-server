'use strict'
const assert = require('assert')
const dayjs = require('dayjs')
const BaseService = require('../core/base_service')

module.exports = class CommonService extends BaseService {
  constructor (props) {
    super(props)
    this.tableName = ''
  }
  setTableName (tableName) {
    assert(tableName, 'tableName is required')

    this.tableName = tableName
    return this
  }
}
