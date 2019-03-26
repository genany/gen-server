'use strict'

const Controller = require('../core/base_controller')

module.exports = class LayoutController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'layout'
  }

  async page () {
    const reqData = this.ctx.getReqDataByData()
    const pageSize = reqData.pageSize || 1
    const page = reqData.page || 1

    const pageData = await this.pageData(pageSize, page, false, false, false)
    // console.log('​AppController -> page -> pageData', pageData)
    const promises = pageData.list.map(async item => {
      item.scaffold = await this.controller('scaffold').infoData({
        id: item.scaffold_id
      })
    })
    await Promise.all(promises).catch(e => {
      this.ctx.logger.error(e, '出错了')
    })

    this.ctx.success(pageData)
  }

  async save () {
    await this.saveColumns({
      id: 'id',
      scaffold_id: 'scaffold_id',
      name: 'name',
      label: 'label',
      desc: 'desc',
      template: 'template'
    })
  }
}
