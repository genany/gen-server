const Base = require('./base.js');
const _ = require('lodash');

module.exports = class extends Base {
  indexAction() {
  	const req = this.ctx.req;
  	// console.log(req)
    return this.display();
  }

  async userInfoAction(){
    let userInfo = await this.session('userInfo');
    if(userInfo){
      return this.success(userInfo);
    }else{
      return this.fail(999, '未登录');
    }
  }

  async loginAction(){
    let data = this.getReqData();
    let userName = data.user_name;
  	let userPass = data.user_pass;

    if(!userName){
      return this.fail(1002, '请输入用户名', {});
    }

    if(!userPass){
      return this.fail(1003, '请输入用户密码', {});
    }

    userPass = think.md5(userPass);
    const userModel = this.model('user')
    let existUser = await userModel.getUserByName(userName);

    if(_.isEqual(existUser, {})){
      return this.fail(1001, '用户名不存在', {});
    }

    const user = await userModel.getUser(userName, userPass);

    if(!_.isEqual(user, {})){
      await this.session('userInfo', user);
      return this.success(user, '登录成功');
    }else{
      return this.fail(1004, '密码错误', user);
    }
  }

  async logoutAction(){
    await this.session(null);
    return this.success({}, '退出登录');
  }

  async registerAction(){
    let data = this.getReqData();
    let userEmail = data.user_email;
    let userName = data.user_name;
    let userPass = data.user_pass;
    userPass = think.md5(userPass);
    let userData = {
      user_email: userEmail,
      user_name: userName,
      user_pass: userPass,
    };

    const userModel = this.model('user')
    let user = await userModel.getUserByName(userName);
    if(!_.isEqual(user, {})){
      return this.fail(1001, '用户名已存在', {});
    }
    user = await userModel.getUserByEmail(userEmail);
    if(!_.isEqual(user, {})){
      return this.fail(1002, '邮箱已存在', {});
    }

    const insertId = await userModel.addUser(userData);
    user = await userModel.getUserByName(userName);
    await this.session('userInfo', user);
    return this.success(user, '注册成功');

  }
  async removeAction(){
    var data = this.getReqData();
    const model = this.model('user');
    let resData = await model.remove(data.id);

    return this.success({id: data.id}, '删除');
  }
};
