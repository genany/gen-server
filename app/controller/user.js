'use strict'

const Controller = require('../core/base_controller')
const md5 = require('md5')
const _ = require('lodash')

module.exports = class UserController extends Controller {
  constructor (props) {
    super(props)
    this.tableName = 'user'
  }

  async index () {
    this.ctx.body = '欢迎'
  }

  async nologin(){
    this.ctx.fail(1000, '未登录')
  }

  async login () {
    const reqData = this.ctx.getReqDataByData()
    console.log('​UserController -> login -> reqData', reqData)
    let userName = reqData.user_name
    let userPass = reqData.user_pass

    if (!userName) {
      return this.ctx.fail(1002, '请输入用户名', {})
    }

    if (!userPass) {
      return this.ctx.fail(1003, '请输入用户密码', {})
    }

    userPass = md5(userPass)

    const existUsers = await this.service.user.getUserByName(userName)

    if (!existUsers) {
      return this.ctx.fail(1001, '用户名不存在', {})
    }

    const user = await this.service.user.getUser(userName, userPass)

    if (user) {
      this.ctx.session.userInfo = user
      return this.ctx.success(user, '登录成功')
    } else {
      return this.ctx.fail(1004, '密码错误', user)
    }
  }
  async logout () {
    this.ctx.session.userInfo = null
    this.ctx.success({}, '退出登录')
  }
  async register () {
    let reqData = this.ctx.getReqDataByData()
    let userEmail = reqData.user_email
    let userName = reqData.user_name
    let userPass = reqData.user_pass
    userPass = md5(userPass)
    let userData = {
      user_email: userEmail,
      user_name: userName,
      user_pass: userPass
    }

    if (!userName) {
      return this.ctx.fail(1002, '请输入用户名', {})
    }

    if (!userPass) {
      return this.ctx.fail(1003, '请输入用户密码', {})
    }
    if (!userEmail) {
      return this.ctx.fail(1003, '请输入用户邮箱', {})
    }

    let user = await this.service.user.getUserByName(userName)
    if (user) {
      return this.ctx.fail(1001, '用户名已存在', {})
    }
    user = await this.service.user.getUserByEmail(userEmail)
    if (user) {
      return this.ctx.fail(1002, '邮箱已存在', {})
    }

    const flag = await this.service.user.addUser(userData)
    if (!flag) {
      return this.ctx.fail(1005, '注册失败', {})
    }
    user = await this.service.user.getUserByName(userName)
    this.ctx.session.userInfo = user
    this.ctx.success(user, '注册成功')
  }
}
