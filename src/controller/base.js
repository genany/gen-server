const helper = require('think-helper');

module.exports = class extends think.Controller {
  __call(){
    this.fail(2000, 'not method');
  }
  async __before() {
    var whiteList = [
      '/user/userInfo',
      '/user/login',
      '/user/logout',
      '/user/register',

    ];

    var reqUrl = this.ctx.path;
    if(whiteList.indexOf(reqUrl) == -1){
      var user = await this.session('userInfo');

      if(!user){
        this.fail(1000, 'not login');
        return false;
      }
    }
  }

  page(resData){
    var newData = {
      list: resData.data,
      page: resData.currentPage,
      pageSize: resData.pagesize,
      total: resData.count,
    };

    return newData;
  }

  getReqData(key){

    let data = null;

    if(this.isPost){
      data = this.post();
    }else if(this.isGet){
      data = this.get('data');
    }

    if(!data){
      data = {};
    }

    if(typeof data == 'string'){
      data = JSON.parse(data);
    }

    return data;
  }

  getReqDataByData(key){
    key = key || 'data';
    let data = this.isPost ? this.post(key) : this.get(key);
    if(!data){
      data = '{}';
    }

    if(typeof data == 'string'){
      data = JSON.parse(data);
    }

    return data;
  }

  //来自think源码        默认成功200
  success(data = '', message = '请求成功') {
    const obj = {
      [this.config('errnoField')]: 200,
      [this.config('errmsgField')]: message,
      data
    };
    this.type = this.config('jsonContentType');
    this.body = obj;
    return false;
  }
  fail(errno, errmsg = '请求失败', data = {}) {
    let obj;
    if (helper.isObject(errno)) {
      obj = errno;
    } else {
      if (/^[A-Z_]+$/.test(errno)) {
        const messages = think.app.validators.messages || {};
        const msg = messages[errno];
        if (think.isArray(msg)) {
          [errno, errmsg] = msg;
        }
      }
      if (!think.isNumber(errno)) {
        [data, errmsg, errno] = [errmsg, errno, this.config('defaultErrno')];
      }
      obj = {
        [this.config('errnoField')]: errno,
        [this.config('errmsgField')]: errmsg
      };
      if (data) {
        obj.data = data;
      }
    }
    this.type = this.config('jsonContentType');
    this.body = obj;
    return false;
  }
};
