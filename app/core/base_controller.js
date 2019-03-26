'use strict'

const Controller = require('egg').Controller
const assert = require('assert')

module.exports = class BaseController extends Controller {
  constructor (props) {
    super(props)
    this.conn = this.app.mysql
  }
  // 非真正其他控制器，只是改了下tableName
  controller (tableName, conn) {
    const proxy = new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) {
          if (prop === 'tableName') {
            return tableName
          } else {
            return target[prop]
          }
        }
      }
    })
    return proxy
  }
  index () {
    this.ctx.body = 'Hi, Welcome'
  }
  async list (isOutputSuccess = true) {
    return this.listData({}, isOutputSuccess)
  }

  async page (isOutputSuccess = true) {
    const reqData = this.ctx.getReqDataByData()
    const pageSize = reqData.pageSize || 1000
    const page = reqData.page || 1

    return this.pageData(pageSize, page, false, false, isOutputSuccess)
  }

  async search (isOutputSuccess = true) {
    // assert(this.tableName, 'tableName is required')
  }
  async searchPage (isOutputSuccess = true) {
    // assert(this.tableName, 'tableName is required')
  }
  async info (isOutputSuccess = true) {
    const reqData = this.ctx.getReqDataByData()
    const id = reqData.id
    if (!id) {
      this.ctx.fail(10001, 'id is required')
      return false
    }

    return this.infoData({ id }, false, isOutputSuccess)
  }

  async remove (isOutputSuccess = true) {
    assert(this.tableName, 'tableName is required')

    const reqData = this.ctx.getReqDataByData()
    const id = reqData.id

    if (!id) {
      return this.ctx.fail(10002, 'id is required')
    }

    return this.removeData({ id }, isOutputSuccess)
  }

  async save (isOutputSuccess = true) {
    if (this.dataMap) {
      const reqData = this.ctx.getReqDataByData()
      const where = this.where(reqData)
      await this.saveDataMap(this.dataMap, reqData, where, isOutputSuccess)
    } else {
      this.ctx.body = '请实现save方法'
    }
  }

  async saveDataMap (dataMap, reqData, where, isOutputSuccess = false) {
    if (!Object.keys(reqData).length) {
      this.ctx.fail(10003, 'save request data not empty')
      return false
    }

    let data = {}
    let dataFields = Object.keys(dataMap)

    if (!dataFields.length) {
      this.ctx.fail(10004, 'update field data not empty')
      return false
    }

    dataFields.forEach(sqlField => {
      data[sqlField] = reqData[dataMap[sqlField]]
    })
    return await this.saveData(data, where, isOutputSuccess)
  }
  async saveData (data, where, isOutputSuccess = false) {
    assert(this.tableName, 'tableName is required')

    if (!Object.keys(data).length) {
      this.ctx.fail(10005, 'save field data not empty')
      return false
    }

    let id

    if (!where) {
      id = await this.addData(data, false)
    } else {
      id = where.id
      const flag = await this.editData(data, where, false)

      if (!flag) {
        this.ctx.fail(10006, '保存失败')
        return false
      }
    }

    if (isOutputSuccess) {
      return this.ctx.success({ id }, '保存成功')
    } else {
      return id
    }
  }
  async addData (data, isOutputSuccess = false) {
    assert(this.tableName, 'tableName is required')

    if (!Object.keys(data).length) {
      this.ctx.fail(10007, 'add field data not empty')
      return false
    }

    if (this.isRelationCurrUser) {
      data[this.userKey || 'user_id'] = this.ctx.session.userInfo.id
    }

    const id = await this.service.common
      .setTableName(this.tableName)
      .create(data)

    if (!id) {
      this.ctx.fail(10008, '添加失败')
      return false
    }

    if (isOutputSuccess) {
      return this.ctx.success({ id }, '添加成功')
    } else {
      return id
    }
  }
  async editData (data, where, isOutputSuccess = false) {
    assert(this.tableName, 'tableName is required')

    if (!Object.keys(data).length) {
      this.ctx.fail(10009, 'update field data not empty')
      return false
    }

    const result = await this.service.common
      .setTableName(this.tableName)
      .edit(data, where)

    if (!result) {
      this.ctx.fail(100010, '更新失败')
      return false
    }

    if (isOutputSuccess) {
      return this.ctx.success({ id: where.id }, '更新成功')
    } else {
      return result
    }
  }

  async listData (where, isOutputSuccess = false) {
    assert(this.tableName, 'tableName is required')

    const result = await this.service.common
      .setTableName(this.tableName)
      .list(where)
    if (isOutputSuccess) {
      return this.ctx.success(result)
    } else {
      return result
    }
  }

  async pageData (pageSize, page, where, columns, isOutputSuccess) {
    assert(this.tableName, 'tableName is required')

    const result = await this.service.common
      .setTableName(this.tableName)
      .page(pageSize, page, where, columns)

    if (isOutputSuccess) {
      return this.ctx.success(result)
    } else {
      return result
    }
  }

  async infoData (where, columns, isOutputSuccess = false) {
    assert(this.tableName, 'tableName is required')
    const info = await this.service.common
      .setTableName(this.tableName)
      .info(where, columns)

    if (!info) {
      this.ctx.fail(100011, '不存在')
      return false
    }
    if (isOutputSuccess) {
      return this.ctx.success(info)
    } else {
      return info
    }
  }

  async removeData (where, isOutputSuccess = false) {
    assert(this.tableName, 'tableName is required')

    let flag = await this.service.common
      .setTableName(this.tableName)
      .remove(where)

    if (!flag) {
      return this.ctx.fail(100012, '删除失败')
    }

    if (isOutputSuccess) {
      return this.ctx.success({ ...where }, '删除成功')
    } else {
      return flag
    }
  }

  where (reqData) {
    return { id: reqData.id }
  }
}
