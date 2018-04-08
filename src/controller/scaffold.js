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
    const model = this.model('scaffold');
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

    const model = this.model('scaffold');
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
    const model = this.model('scaffold');
    const resData = await model.info(id);
    return this.success(resData);
  }
  async saveAction(){
    var data = this.getReqData();
    var user = await this.session('userInfo');
    // console.log(user, 333333)
    var editData = {
      id: data.id,
      name: data.name,
      label: data.label,
      desc: data.desc,
      file: data.file,
      router_file_path: data.router_file_path,
      router_template: data.router_template,
      menu_file_path: data.menu_file_path,
      menu_template: data.menu_template,
      page_dir: data.page_dir,
      store_template: data.store_template,
      store_dir: data.store_dir,
    };

    if(user && user.id){
      editData.user_id = user.id;
    }

    const model = this.model('scaffold');

    if(data.id){
      await model.edit(editData, {id: data.id});
    }else{
      data.id = await model.create(editData);
    }

    let resData = await model.info(data.id);

    return this.success(resData, '保存成功');
  }
  async removeAction(){
    var data = this.getReqData();
    const model = this.model('scaffold');
    let resData = await model.remove(data.id);

    return this.success({id: data.id}, '删除');
  }

};
