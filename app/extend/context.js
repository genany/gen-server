const assert = require('assert')
const json5 = require('json5')
const dayjs = require('dayjs')
const decodeUriComponent = require('decode-uri-component')

module.exports = {
  // 非真正其他控制器，只是改了下tableName
  controller (tableName, self) {
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
  },
  success (data = {}, msg = '请求成功') {
    const resData = {
      code: 200,
      msg,
      data
    }
    this.body = JSON.stringify(resData)
  },
  fail (code, msg = '请求失败', data = {}) {
    const resData = {
      code: code,
      msg,
      data
    }
    this.body = JSON.stringify(resData)
  },
  async getPageData (tableName, pageSize = 20, page = 1, options = {}) {
    const data = await this.app.mysql.select(tableName, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      ...options
    })

    const total = await this.app.mysql.count(tableName, {
      ...(options.where ? options.where : {})
    })
    const pageData = {
      list: data,
      page,
      pageSize,
      total
    }
    return pageData
  },
  async page (tableName, pageSize = 20, page = 1, options) {
    const resData = await this.getPageData(tableName, pageSize, page, options)
    this.success(resData)
  },

  getReqData (key) {
    let data = {}
    if (this.isPost()) {
      data = this.request.body
    } else if (this.isGet()) {
      data = this.query
    }

    return data
  },
  getReqDataByData (key = 'data') {
    let data = null
    if (this.isGet()) {
      if (this.query.data) {
        try {
          data = json5.parse(decodeUriComponent(this.query.data))
        } catch (e) {
          this.logger.error(e)
          // console.error(e, 'this.query.data 非合法 json5')
        }
      } else {
        try {
          const dataStr = decodeUriComponent(this.request.querystring).trim()

          if (
            dataStr &&
            dataStr.indexOf('{') === 0 &&
            dataStr.lastIndexOf('}') === dataStr.length - 1
          ) {
            const newData = json5.parse(dataStr)
            if (typeof newData === 'object') {
              data = newData
            }
          }
        } catch (e) {
          this.logger.error(e)
        }
      }
    }

    data = data || this.getReqData()

    // console.log('​getReqDataByData -> data', data)
    return data
  },
  isPost () {
    return this.method === 'POST'
  },
  isGet () {
    return this.method === 'GET'
  }
}
