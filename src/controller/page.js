const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }
  async listAction() {
    var data = this.getReqData();
    var page = data.page || 1;
    var pageSize = data.pageSize || 12;
    // var pageSize = 200;
    var user = await this.session('userInfo');
    var userId = data.userId || user.id;
    const model = this.model('page');
    let resData = await model.list(page, pageSize, userId);
    resData = this.page(resData);
    // console.log(33333333);
    return this.success(resData);
  }
  async searchAction(){
    let data = this.getReqData();
    let page = data.page || 1;
    let pageSize = data.pageSize || 12;
    let keyword = data.keyword;

    const model = this.model('page');
    let resData = null;
    if(keyword){
      resData = await model.search(page, pageSize, keyword);
    }else{
      resData = await model.list(page, pageSize);
    }
    resData = this.page(resData);

    return this.success(resData);
  }
  async infoAction(){
    var data = this.getReqData();
    const id = data.id;
    const model = this.model('page');
    const resData = await model.info(id);

    resData.page_template.forEach(item => {
      item.content = JSON.parse(item.content);
    });
    resData.page_component.forEach(item => {
      item.content = JSON.parse(item.content);
    });
    // resData.previewUrl = this.controller('preview', 'getPreviewurl', resData.path);
    return this.success(resData);
  }
  async saveAction(){
    var data = this.getReqData();
    var user = await this.session('userInfo');
    // console.log(user, 333333)
    var editData = {
      id: data.id,
      app_id: data.app_id,
      pid: data.pid,
      dependent: data.dependent,
      name: data.name,
      label: data.label,
      desc: data.desc,
      path: data.path,
    };

    if(user && user.id){
      editData.user_id = user.id;
    }

    const model = this.model('page');

    if(data.id){
      await model.edit(editData, {id: data.id});
    }else{
      data.id = await model.create(editData);
    }
    const pageTemplate = data.page_template[0];
    const templateId = data.template_id || data.page_template[0].template_id || 0;
    const pageTemplateModel = this.model('page_template');
    await pageTemplateModel.removeByPageId(data.id);
    await pageTemplateModel.create({
      page_id: data.id,
      template_id: templateId,
      inter_id: pageTemplate.inter_id || 0,
      content: JSON.stringify(pageTemplate.content),
      sort: 0,
    });

    //删除当前页面所有组件，如果有在添加
    const pageComponentModel = this.model('page_component');
    await pageComponentModel.removeByPageId(data.id);

    if(data.page_component && data.page_component.length > 0){
      data.page_component.forEach( async (item, index) => {
        var editData = {
          page_id: data.id,
          component_id: item.component_id,
          inter_id: item.inter_id || 0,
          content: JSON.stringify(item.content),
          sort: index,
        };
        await pageComponentModel.create(editData);
      });
    }
    let previewCtrl = this.controller('preview');
    let previewUrl = await previewCtrl.buildPreviewUrl(data.id);

    // let resData = await model.info(data.id);

    return this.success({url: previewUrl}, '保存成功');
  }
  async removeAction(){
    var data = this.getReqData();
    const model = this.model('page');
    let resData = await model.remove(data.id);

    return this.success({id: data.id}, '删除');
  }

  async buildPage(id){
    var previewUrl = await this.controller('preview', 'buildPreviewUrl')(id);

    return this.success({url: previewUrl});
  }

};
