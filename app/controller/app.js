'use strict'

const Controller = require('../core/base_controller')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

module.exports = class AppController extends Controller {
  constructor (props) {
    super(props)

    this.tableName = 'app'
    this.isRelationCurrUser = true
    this.dataMap = {
      id: 'id',
      name: 'name',
      label: 'label',
      desc: 'desc',
      inter_app_id: 'inter_app_id',
      base_url: 'base_url',
      scaffold_id: 'scaffold_id',
      layout_id: 'layout_id'
    }
  }

  async info () {
    const reqData = this.ctx.getReqDataByData()
    const id = reqData.id
    if (!id) {
      this.ctx.fail(1001, 'id is required')
      return false
    }

    const info = await this.infoData({ id }, false)
    info.page = await this.controller('page').listData({ app_id: info.id })
    this.ctx.success(info)
  }

  async page () {
    const reqData = this.ctx.getReqDataByData()
    const pageSize = reqData.pageSize || 1000
    const page = reqData.page || 1

    const pageData = await this.pageData(pageSize, page, false, false, false)
    const promises = pageData.list.map(async item => {
      const inter_app = await this.controller('app').infoData({
        id: item.inter_app_id
      })
      if (!inter_app) throw new Error('inter_app error')
      item.inter_app = inter_app
      const scaffold = await this.controller('scaffold').infoData({
        id: item.scaffold_id
      })
      if (!scaffold) throw new Error('scaffold error')
      item.scaffold = scaffold
      const layout = await this.controller('layout').infoData({
        id: item.layout_id
      })
      if (!layout) throw new Error('layout error')
      item.layout = layout
      const page = await this.controller('page').listData({
        app_id: item.id
      })
      if (!page) throw new Error('page error')
      item.page = page
    })

    try {
      await Promise.all(promises)
      this.ctx.success(pageData)
    } catch (e) {
      this.ctx.logger.error(e, '出错了')
    }
  }

  async download () {
    const reqData = this.ctx.getReqDataByData()
    if (!reqData.id) {
      return this.ctx.fail(1001, 'download失败， 此App不存在')
    }
    let appData = await this.service.app.info(reqData.id)
    let scaffoldName = 'genScaffoldAntd' || appData.name
    let downloadName = scaffoldName + '-' + appData.name + '.zip'

    // let zipPath = path.join(__dirname, '../../../scaffold', scaffoldName)
    let zipPath = path.join(this.config.scaffoldDir, scaffoldName)
    zipPath = 'D:\\2.8_0'
    let outPath = path.join(this.config.static.dir, 'file', downloadName)
    let serverPath = path.join('files', downloadName)

    await this.buildZip(zipPath, outPath)
    // this.ctx.downloader(downloadName, downloadName, {
    //   'content-type': 'application/zip'
    // })
    // this.ctx.body = serverPath
    const filePath = path.resolve(this.app.config.static.dir, downloadName)
    this.ctx.attachment(downloadName)
    this.ctx.set('Content-Type', 'application/octet-stream')
    this.ctx.body = fs.createReadStream(filePath)
  }
  async buildZip (inputDir, outputDir) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputDir)
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      })

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes')
        console.log('压缩完成')
        resolve(outputDir)
      })

      output.on('end', function () {
        console.log('Data has been drained')
      })

      archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
        } else {
          throw err
        }
      })

      archive.on('error', function (err) {
        throw err
      })

      archive.pipe(output)

      this.zipDir(archive, inputDir, [
        'node_modules',
        'nohup.out',
        '.git',
        '.idea',
        'example.zip'
      ])
      archive.finalize()
    })
  }

  zipDir (archive, dir, exclude) {
    exclude = exclude || []
    let files = fs.readdirSync(dir)

    files.forEach(item => {
      let filePath = dir + path.sep + item
      if (exclude.indexOf(item) == -1) {
        let stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {
          archive.directory(filePath, item, { name: item })
        } else if (stat.isFile()) {
          archive.append(fs.createReadStream(filePath), { name: item })
        }
      }
    })
  }
}
