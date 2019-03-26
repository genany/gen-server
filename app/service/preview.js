'use strict'
const BaseService = require('../core/base_service')
const handlePage = require('gen-render')
const { HjsonData } = require('hjson2')

module.exports = class PageService extends BaseService {
  constructor (props) {
    super(props)
  }

  async buildPreviewUrl (data) {
    let pageData = await this.service.common
      .setTableName('page')
      .info({ id: data.id }, false)
    let appData = await this.service.common
      .setTableName('app')
      .info({ id: pageData.app_id }, false)
    let pagesData = await this.service.common
      .setTableName('page')
      .list({ app_id: appData.id })
    let scaffoldData = await this.service.common
      .setTableName('scaffold')
      .info({ id: appData.scaffold_id }, false)
    let scaffoldExtraTemplate = await this.service.common
      .setTableName('extra_template')
      .list({
        module_instance_id: scaffoldData.id
      })
    let interData = await this.service.common
      .setTableName('inter')
      .info({ id: data.inter_id }, false)

    let templateHjson = new HjsonData().parse(interData.comments)
    let templateInfo = templateHjson.getRootCommentJson()
    let templateName = templateInfo.template.__componentName

    let templateData = await this.service.common
      .setTableName('template')
      .info({ name: templateName })
    let componentsData = await this.service.common
      .setTableName('component')
      .list()

    scaffoldData.extra_template = scaffoldExtraTemplate

    templateData.extra_field = await this.service.common
      .setTableName('template_extra_field')
      .list({
        template_id: templateData.id
      })

    const promises = componentsData.map(async item => {
      const extra_field = await this.service.common
        .setTableName('component_extra_field')
        .list({
          component_id: item.id
        })
      if (!extra_field) throw new Error('extra_field error')
      item.extra_field = extra_field
    })

    await Promise.all(promises)

    appData.page = pagesData

    let previewUrl = await handlePage.outputPage(
      pageData,
      appData,
      scaffoldData,
      interData,
      templateData,
      componentsData,
      this.config.scaffoldDir
    )
    await handlePage.outputConfigFile(
      pageData,
      appData,
      scaffoldData,
      interData,
      this.config.scaffoldDir
    )
    return previewUrl
  }
  async preview (pageData, interData) {
    // let pageData = await this.service.common
    //   .setTableName('page')
    //   .info({ id: data.id }, false)
    let appData = await this.service.common
      .setTableName('app')
      .info({ id: pageData.app_id }, false)
    let pagesData = await this.service.common
      .setTableName('page')
      .list({ app_id: appData.id })
    let scaffoldData = await this.service.common
      .setTableName('scaffold')
      .info({ id: appData.scaffold_id }, false)
    let scaffoldExtraTemplate = await this.service.common
      .setTableName('extra_template')
      .list({
        module_instance_id: scaffoldData.id
      })
    // let interData = await this.service.common
    //   .setTableName('inter')
    //   .info({ id: data.inter_id }, false)

    let templateHjson = new HjsonData().parse(interData.comments)
    let templateInfo = templateHjson.getRootCommentJson()
    let templateName = templateInfo.template.__componentName

    let templateData = await this.service.common
      .setTableName('template')
      .info({ name: templateName })
    let componentsData = await this.service.common
      .setTableName('component')
      .list()

    scaffoldData.extra_template = scaffoldExtraTemplate

    templateData.extra_field = await this.service.common
      .setTableName('template_extra_field')
      .list({
        template_id: templateData.id
      })

    const promises = componentsData.map(async item => {
      const extra_field = await this.service.common
        .setTableName('component_extra_field')
        .list({
          component_id: item.id
        })
      if (!extra_field) throw new Error('extra_field error')
      item.extra_field = extra_field
    })

    await Promise.all(promises)

    appData.page = pagesData

    let previewUrl = await handlePage.outputPage(
      pageData,
      appData,
      scaffoldData,
      interData,
      templateData,
      componentsData,
      this.config.scaffoldDir
    )
    await handlePage.outputConfigFile(
      pageData,
      appData,
      scaffoldData,
      interData,
      this.config.scaffoldDir
    )
    return previewUrl
  }
}
