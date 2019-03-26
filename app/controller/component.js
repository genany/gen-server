'use strict'

const Controller = require('../core/base_controller')

module.exports = class ComponentController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'component'
  }

  async page () {
    const reqData = this.ctx.getReqDataByData()
    const pageSize = reqData.pageSize || 1000
    const page = reqData.page || 1

    const pageData = await this.pageData(pageSize, page, false, false, false)
    const promises = pageData.list.map(async item => {
      const extra_field = await this.controller(
        'component_extra_field'
      ).listData({
        component_id: item.id
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
    info.extra_field = await this.controller('component_extra_field').listData({
      component_id: info.id
    })
    this.ctx.success(info)
  }

  async save () {
    const reqData = this.ctx.getReqDataByData()
    const componentId = await this.saveData(
      {
        pid: reqData.pid || 0,
        dependent: reqData.dependent,
        name: reqData.name,
        label: reqData.label,
        desc: reqData.desc,
        template: reqData.template
      },
      reqData.id ? { id: reqData.id } : false
    )

    if (!componentId) return

    const component = await this.infoData({ id: componentId })

    const componentExtraFieldCtrl = await this.controller(
      'component_extra_field'
    )

    if (reqData.id) {
      const removeFlag = await componentExtraFieldCtrl.removeData(
        { component_id: componentId },
        false
      )

      if (!removeFlag) return
    }

    let promises = []
    if (reqData.extra_field) {
      component.extra_field = []
      promises = reqData.extra_field.map(async (item, index) => {
        let editData = {
          component_id: componentId,
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

        const extraFieldId = await componentExtraFieldCtrl.addData(editData)

        if (!extraFieldId) {
          throw new Error(extraField)
        }
        const extraField = await componentExtraFieldCtrl.infoData({
          id: extraFieldId
        })
        if (!extraField) {
          throw new Error(extraField)
        }
        component.extra_field.push(extraField)
      })
    }

    try {
      await Promise.all(promises)
      this.ctx.success(component)
    } catch (e) {
      this.ctx.logger.error(e)
    }
  }
  async remove () {
    const reqData = this.ctx.getReqDataByData()
    const componentId = reqData.id
    const componentFlag = await this.removeData(
      {
        id: componentId
      },
      false
    )

    if (!componentFlag) return

    const extraFieldFlag = await this.controller(
      'component_extra_field'
    ).removeData(
      {
        component_id: componentId
      },
      false
    )

    if (!extraFieldFlag) return

    this.ctx.success({ id: componentId })
  }
}
