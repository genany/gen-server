'use strict'

const Controller = require('../core/base_controller')

module.exports = class PreviewController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'preview'
  }

  async preview () {
    const reqData = this.ctx.getReqDataByData()
    reqData.path = '/Preview/Preview'
    let previewUrl = await this.service.preview.preview(
      reqData,
      reqData.interInfo
    )

    return this.ctx.success({ url: previewUrl })
  }
}
