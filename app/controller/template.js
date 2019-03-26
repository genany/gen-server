'use strict'

const Controller = require('../core/base_controller')

module.exports = class TemplateController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'template'
  }

  async page () {
    const reqData = this.ctx.getReqDataByData()
    const pageSize = reqData.pageSize || 1000
    const page = reqData.page || 1

    const pageData = await this.pageData(pageSize, page, false, false, false)
    const promises = pageData.list.map(async item => {
      const extra_field = await this.controller(
        'template_extra_field'
      ).listData({
        template_id: item.id
      })
      if (!extra_field) throw new Error('extra_field error')
      item.extra_field = extra_field
    })

    try {
      await Promise.all(promises)
      this.ctx.success(pageData)
    } catch (e) {
      this.ctx.logger.error(e, '出错了')
    }
  }

  async info () {
    const reqData = this.ctx.getReqDataByData()
    const id = reqData.id
    if (!id) {
      this.ctx.fail(1001, 'id is required')
      return false
    }

    const info = await this.infoData({ id }, false, false)
    info.extra_field = await this.controller('template_extra_field').listData({
      template_id: info.id
    })
    this.ctx.success(info)
  }

  async save () {
    const reqData = this.ctx.getReqDataByData()
    const templateId = await this.saveData(
      {
        scaffold_id: reqData.scaffold_id,
        name: reqData.name,
        label: reqData.label,
        desc: reqData.desc,
        cate_id: reqData.cate_id,
        template: reqData.template
      },
      reqData.id ? { id: reqData.id } : false
    )

    if (!templateId) return

    const template = await this.infoData({ id: templateId })

    const templateExtraFieldCtrl = await this.controller('template_extra_field')

    if (reqData.id) {
      const removeFlag = await templateExtraFieldCtrl.removeData(
        { template_id: templateId },
        false
      )

      if (!removeFlag) return
    }

    let promises = []
    if (reqData.extra_field) {
      template.extra_field = []
      promises = reqData.extra_field.map(async (item, index) => {
        let editData = {
          template_id: templateId,
          name: item.name,
          label: item.label,
          desc: item.desc,
          type: item.type,
          value_type: item.value_type,
          options: item.options || [],
          default_value: item.default_value,
          sort: item.sort || index,
          required: item.required
        }

        const extraFieldId = await templateExtraFieldCtrl.addData(editData)

        if (!extraFieldId) {
          throw new Error(extraField)
        }
        const extraField = await templateExtraFieldCtrl.infoData({
          id: extraFieldId
        })
        if (!extraField) {
          throw new Error(extraField)
        }
        template.extra_field.push(extraField)
      })
    }

    try {
      await Promise.all(promises)
      this.ctx.success(template)
    } catch (e) {
      this.ctx.logger.error(e)
    }
  }
  async remove () {
    const reqData = this.ctx.getReqDataByData()
    const templateId = reqData.id
    const templateFlag = await this.removeData(
      {
        id: templateId
      },
      false
    )

    if (!templateFlag) return

    const extraFieldFlag = await this.controller(
      'template_extra_field'
    ).removeData(
      {
        template_id: templateId
      },
      false
    )

    if (!extraFieldFlag) return

    this.ctx.success({ id: templateId })
  }
}
