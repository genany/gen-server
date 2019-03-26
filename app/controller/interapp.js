'use strict'

const Controller = require('../core/base_controller')

module.exports = class InterAppController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'inter_app'
  }

  async save () {
    await this.saveColumns({
      id: id,
      name: name,
      label: label,
      desc: desc,
      base_url: base_url
    })
  }
}
