'use strict'

const Controller = require('../core/base_controller')

module.exports = class ValidController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'valid'
    this.dataMap = {
      id: 'id',
      name: 'name',
      label: 'label',
      desc: 'desc',
      rule: 'rule',
      error_msg: 'error_msg',
      success_msg: 'success_msg'
    }
  }

  where (reqData) {
    if (reqData.id) {
      return { id: reqData.id }
    } else {
    }
  }
}
