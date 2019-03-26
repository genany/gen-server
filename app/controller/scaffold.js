'use strict'
const path = require('path')
const Controller = require('../core/base_controller')
const {
  outputPage,
  outputConfigFile,
  dirTree,
  getDirFiles,
  getFileContent
} = require('gen-render')
const pump = require('mz-modules/pump')
const fs = require('fs')
const extract = require('extract-zip')
const simpleGit = require('simple-git')

module.exports = class ScaffoldController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'scaffold'
  }

  async info () {
    const reqData = this.ctx.getReqDataByData()
    const id = reqData.id
    if (!id) {
      this.ctx.fail(1001, 'id is required')
      return false
    }

    const info = await this.infoData({ id }, false)
    info.extra_template = await this.controller('extra_template').listData({
      module_instance_id: info.id
    })
    this.ctx.success(info)
  }

  async save () {
    const reqData = this.ctx.getReqDataByData()
    const scaffoldId = await this.saveData(
      {
        name: reqData.name,
        label: reqData.label,
        desc: reqData.desc,
        type: reqData.type,
        path: reqData.path,
        file: reqData.file,
        router_file_path: reqData.router_file_path,
        router_template: reqData.router_template,
        menu_file_path: reqData.menu_file_path,
        menu_template: reqData.menu_template,
        page_dir: reqData.page_dir,
        store_template: reqData.store_template,
        store_dir: reqData.store_dir,
        service_template: reqData.service_template,
        service_dir: reqData.service_dir
      },
      reqData.id ? { id: reqData.id } : false
    )
    if (!scaffoldId) return
    const scaffold = await this.infoData({ id: scaffoldId })

    const deleteFlag = await this.controller('extra_template').removeData({
      module_instance_id: scaffoldId
    })

    if (!deleteFlag) return
    let promises = []
    if (reqData.extra_template) {
      scaffold.extra_template = []
      promises = reqData.extra_template.map(async (item, index) => {
        var editData = {
          module: 'scaffold',
          module_instance_id: scaffoldId,

          name: item.name,
          label: item.label,
          desc: item.desc,
          dir: item.dir,
          template: item.template
        }
        const extraTemplateId = await this.controller(
          'extra_template'
        ).saveData(editData)

        if (!extraTemplateId) {
          throw new Error(extraTemplateId)
        }

        const extraTemplate = await this.controller('extra_template').infoData({
          id: extraTemplateId
        })

        if (!extraTemplate) {
          throw new Error(extraTemplate)
        }

        scaffold.extra_template.push(extraTemplate)
      })
    }

    try {
      await Promise.all(promises)
      this.ctx.success(scaffold)
    } catch (e) {
      this.ctx.logger.error(e)
    }
  }

  async upload () {
    let filePath = ''
    let scaffoldDir = this.config.scaffoldDir
    try {
      const stream = await this.ctx.getFileStream()
      const extname = path.extname(stream.filename)
      const filename = path.basename(stream.filename, extname)
      const zipFile = path.join(scaffoldDir, filename + extname)
      const scaffoldPath = path.join(scaffoldDir, filename)
      if (fs.existsSync(scaffoldPath)) {
        this.ctx.fail(10013, `${filename}脚手架已存在`)
        return
      }

      const writeStream = fs.createWriteStream(zipFile)
      await pump(stream, writeStream)
      await this.unzip(zipFile, scaffoldPath)
      fs.unlinkSync(zipFile)

      return this.ctx.success({ path: filename })
    } catch (error) {
      this.ctx.fail(10010, '上传失败')
    }
  }

  async pullCode () {
    const reqData = this.ctx.getReqDataByData()
    try {
      const gitUrl = reqData.path
      const extname = path.extname(gitUrl)
      const filename = path.basename(gitUrl, extname)
      const scaffoldDir = this.config.scaffoldDir
      const scaffoldPath = path.join(scaffoldDir, filename)
      if (fs.existsSync(scaffoldPath)) {
        this.ctx.fail(10013, `${filename}脚手架已存在`)
        return
      }
      const git = simpleGit(scaffoldDir)
      await git.clone(gitUrl)
      return this.ctx.success({ path: filename })
    } catch (error) {
      this.ctx.fail(10011, '拉取代码失败')
    }
  }

  async unzip (source, target) {
    return new Promise((resolve, reject) => {
      extract(source, { dir: target }, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(target)
        }
      })
    })
  }

  async files () {
    let reqData = this.ctx.getReqDataByData()
    // const scaffold = await this.infoData({
    //   id: reqData.id
    // })
    let cwd = path.join(this.config.scaffoldDir, reqData.scaffoldDir)
    let files = await getDirFiles(cwd, reqData.dir)

    return this.ctx.success({ list: files }, '文件列表')
  }
  async fileContent () {
    let reqData = this.ctx.getReqDataByData()
    // const scaffold = await this.infoData({
    //   id: reqData.id
    // })
    let cwd = path.join(this.config.scaffoldDir, reqData.scaffoldDir)
    let content = await getFileContent(path.join(cwd, reqData.file))

    return this.ctx.success(content, '文件内容')
  }
}
