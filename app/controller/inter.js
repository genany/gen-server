'use strict';

const Controller = require('../core/base_controller');

module.exports = class InterController extends Controller {
  constructor(props) {
    super(props);
    this.tableName = 'inter';
    this.dataMap = {
      id: 'id',
      inter_app_id: 'inter_app_id',
      name: 'name',
      label: 'label',
      desc: 'desc',
      cate_id: 'cate_id',
      method: 'method',
      url: 'url',
      req: 'req',
      header: 'header',
      res: 'res',
      res_header: 'res_header',
      comments: 'comments',
      source: 'source',
    };
  }

  async save() {
    const reqData = this.ctx.getReqDataByData();
    const interFlag = this.saveData(
      {
        inter_app_id: reqData.inter_app_id,
        name: reqData.name,
        label: reqData.label,
        desc: reqData.desc,
        cate_id: reqData.cate_id,
        method: reqData.method,
        url: reqData.url,
        req: reqData.req || '',
        header: reqData.header || '',
        res: reqData.res || '',
        res_header: reqData.res_header || '',
        comments: reqData.comments || '',
        source: reqData.source || '',
        user_id: this.ctx.session.userInfo.id,
      },
      reqData.id ? { id: reqData.id } : false,
      true
    );

    if (!interFlag) return;
    this.ctx.success({});
  }
};
