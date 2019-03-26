'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app

  const commonRouters = [
    'app',
    'page',
    'template',
    'scaffold',
    'component',
    'inter',
    'interapp',
    'layout',
    'valid'
    // 'componentExtraField'
  ]

  commonRouters.forEach(ctrlName => {
    ;['list', 'page', 'search', 'info', 'save', 'remove'].forEach(
      ctrlMethod => {
        getPost(
          router,
          `/${ctrlName}/${ctrlMethod}`,
          middleware.auth(),
          `${ctrlName}.${ctrlMethod}`
        )
      }
    )
  })

  router.get('/', controller.home.index)

  getPost(router, '/user/login', 'user.login')
  getPost(router, '/user/logout', 'user.logout')
  getPost(router, '/user/nologin', 'user.nologin')
  getPost(router, '/user/info', middleware.auth(), 'user.info')
  getPost(router, '/user/register', 'user.register')
  getPost(router, '/user/remove', middleware.auth(), 'user.remove')

  getPost(router, '/app/download', middleware.auth(), 'app.download')

  getPost(router, '/preview/preview', middleware.auth(), 'preview.preview')

  getPost(router, '/scaffold/upload', middleware.auth(), 'scaffold.upload')
  getPost(router, '/scaffold/pullCode', middleware.auth(), 'scaffold.pullCode')
  getPost(router, '/scaffold/files', middleware.auth(), 'scaffold.files')
  getPost(
    router,
    '/scaffold/fileContent',
    middleware.auth(),
    'scaffold.fileContent'
  )
}

function getPost (router, ...params) {
  // console.log(arguments)
  router.get.apply(router, params)
  router.post.apply(router, params)
}

function all (router, ...params) {
  router.get.apply(router, params)
  router.post.apply(router, params)
  router.head.apply(router, params)
  router.options.apply(router, params)
  router.put.apply(router, params)
  router.patch.apply(router, params)
  router.delete.apply(router, params)
}
