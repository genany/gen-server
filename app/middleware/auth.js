module.exports = () => {
  return async function (ctx, next) {
    if(ctx.session.userInfo){
      await next();
    }else{
      ctx.redirect('/user/nologin')
    }
  }
}
