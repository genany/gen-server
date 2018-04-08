module.exports = (options, app) => {
  return (ctx, next) => {
    // console.log(333333333333333333)
    // ctx.res.headers();
    // console.log(ctx.req.body, 3333333333333333)
    const host = ctx.req.headers.host;
    // let originUrl = 'http://' + host;
    // if(!ctx.req.body){
    //   ctx.req.body = JSON.parse(ctx.request.body);
    // }
    let originUrl = ctx.req.headers.origin || 'http://' + host;
    // console.log(originUrl, 'originUrl')
    // originUrl = 'http://127.0.0.1:3000';
    // console.log('originUrl', originUrl)
    ctx.res.setHeader('Access-Control-Allow-Origin', originUrl);
    ctx.res.setHeader('Access-Control-Allow-Credentials', 'true');
    ctx.res.setHeader('Access-Control-Request-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    ctx.res.setHeader('Access-Control-Request-Headers', 'Cache-Control,Access-Control-Request-Method,Accept-Language,Accept-Encoding,Origin,X-Requested-With,Accept,Engaged-Auth-Token');
    ctx.res.setHeader('X-XSS-Protection', '0');
    // console.log(ctx.res.headers);
    // console.log(ctx.headers);
    return next();
  }
}
