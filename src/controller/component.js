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
    const model = this.model('component');
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

    const model = this.model('component');
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
    const model = this.model('component');
    const resData = await model.info(id);
    return this.success(resData);
  }
  async saveAction(){
    var data = this.getReqData();
    var user = await this.session('userInfo');
    // console.log(user, 333333)
    var editData = {
      id: data.id,
      pid: data.pid || 0,
      // template_id: data.template_id,
      name: data.name,
      label: data.label,
      desc: data.desc,
      template: data.template,
    };

    if(user && user.id){
      editData.user_id = user.id;
    }


    const model = this.model('component');

    if(data.id){
      await model.edit(editData, {id: data.id});
    }else{
      data.id = await model.create(editData);
    }

    //删除当前页面所有模版，如果有在添加
    const extraFieldModel = this.model('component_extra_field');
    await extraFieldModel.removeByComponentId(data.id);

    if(data.extra_field && data.extra_field.length > 0){
      data.extra_field.forEach( async (item, index) => {
        var editData = {
          component_id: data.id,
          name: item.name,
          label: item.label,
          desc: item.desc,
          type: item.type,
          options: item.options || "[]",
          default_value: item.default_value,
          sort: item.sort,
          sort: index,
        };
        await extraFieldModel.create(editData);
      });
    }

    let resData = await model.info(data.id);

    return this.success(resData, '保存成功');
  }
  async removeAction(){
    var data = this.getReqData();
    const model = this.model('component');
    let resData = await model.remove(data.id);

    return this.success({id: data.id}, '删除');
  }

};
