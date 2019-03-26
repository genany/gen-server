'use strict'

const Controller = require('../core/base_controller')
const simpleGit = require('simple-git')

module.exports = class PageController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'page'
  }

  async save () {
    const reqData = this.ctx.getReqDataByData()

    const pageFlag = await this.saveData(
      {
        app_id: reqData.app_id,
        // pid: reqData.pid,
        name: reqData.name,
        inter_id: reqData.inter_id,
        label: reqData.label,
        desc: reqData.desc,
        path: reqData.path
      },
      reqData.id ? { id: reqData.id } : false
    )
    if (!pageFlag) return
    const interInfo = reqData.interInfo

    const interFlag = this.controller('inter').saveData(
      {
        req: interInfo.req || '',
        res: interInfo.res || '',
        comments: interInfo.comments || '',
        header: interInfo.header || '',
        res_header: interInfo.res_header || ''
      },
      reqData.inter_id ? { id: reqData.inter_id } : false
    )

    if (!interFlag) return

    let previewUrl = await this.service.preview.buildPreviewUrl(reqData)

    try {
      const scaffoldDir = this.config.scaffoldDir
      const git = simpleGit(scaffoldDir)
      const commitMsg = reqData.id
        ? `fix: 编辑${reqData.name}页面`
        : `feat: 添加${reqData.name}页面`
      await git.add('.').commit(commitMsg)
    } catch (error) {
      console.log(
        'TCL: PageController -> }catch -> error git commit提交失败',
        error
      )
    }

    return this.ctx.success({ url: previewUrl })
  }

  async remove () {
    const reqData = this.ctx.getReqDataByData()

    const templateId = reqData.id
    const templateFlag = await this.removeData({
      id: templateId
    })

    if (!templateFlag) return

    const extraFieldFlag = await this.controller(
      'template_extra_field'
    ).removeData({
      template_id: templateId
    })
    if (!extraFieldFlag) return
    this.ctx.success({ id: templateId })
  }
}
