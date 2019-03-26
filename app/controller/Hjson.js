const Hjson = require('hjson')
const _ = require('lodash')
class HjsonData {
  constructor () {
    this.obj = null
    this.comments = null
    this.startCommentSymbol = '/*'
    this.endCommentSymbol = '*/'
  }
  parse (hjsonText, opts) {
    opts = opts || { keepWsc: true }

    this.obj = Hjson.parse(hjsonText, opts)

    this.comments = Hjson.comments.extract(this.obj) || { s: {}, o: [], r: '' }
    // console.log('TCL: HjsonData -> parse -> this.obj', this.obj);
    // console.log('TCL: HjsonData -> parse -> this.comments', this.comments);
    // console.log(JSON.stringify(this.comments));

    // this.parseKey(this.obj, []);//暂时不支持 后续优化吧

    return this
  }
  stringify (opts) {
    opts = opts || {}
    return Hjson.rt.stringify(this.obj, opts)
  }
  stringifyComments () {
    return Hjson.stringify(this.comments)
  }
  getCommentJson (varName, pos) {
    let hjson = this.getCommentHjson(varName, pos)
    return hjson.obj
  }
  getCommentHjson (varName, pos) {
    let comment = this.getComment(varName, pos)
    let commentHjson = new HjsonData().parse(comment)
    this.parseKey(commentHjson.obj, [])

    return commentHjson
  }
  /*
    ui|button|view: {
        text: 查看
        href: /user/info
    }
    ui|confirmButton|remove: {
        text: 删除
        title: 确认删除吗
        confirm: () => {
            this.remove && this.remove(record)
        }
    }
    ui|button|edit: {
        text: 编辑
        action: () => {
            this.edit && this.edit(record)
        }
    }
    ui|switch|status: {
        action: () => {
            this.changeStatus && this.changeStatus(record.status, record)
        },
    }
*/
  //  opt: 操作;
  parseKey2 (obj, paths) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (_.isPlainObject(item)) {
          this.parseKey(item, paths.concat(index))
        }
      })
    } else if (_.isPlainObject(obj)) {
      const keys = Object.keys(obj)

      let newHjson = null
      keys.forEach(key => {
        const arr = key.split('|')
        const value = this.parseKey(obj[key])

        let newPaths = paths.concat(key)
        if (arr.length > 1) {
          let newKey = arr[0]
          let newPaths = paths.concat(key)
          const comment = this.getComment(newPaths)
          const componentName = arr[1]
          const params = arr.slice(2)
          const component = {
            __componentName: componentName,
            __componentParams: params,
            ...value
          }

          params.forEach((param, index) => {
            component['__componentParam' + index] = param
          })
          newHjson = newHjson || new HjsonData().parse(`{}`)
          let newKeyValue = newHjson.getVar(newKey)
          if (!newKeyValue) {
            newHjson.setVar(newKey, [])
            newHjson.setVar([newKey, 0], component)
          } else {
            newHjson.setVar([newKey, newKeyValue.length - 1], component)
          }
        }
        if (_.isPlainObject(obj)) {
          this.parseKey(value, newPaths)
        }
      })

      newHjson &&
        Object.keys(newHjson.obj).forEach(key => {
          this.setVar(paths.concat(key), newHjson.obj[key])
        })
    }
    return obj
  }
  parseKey (obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (_.isPlainObject(item)) {
          this.parseKey(item)
        }
      })
    } else if (_.isPlainObject(obj)) {
      const keys = Object.keys(obj)

      let newHjson = null
      keys.forEach(key => {
        const value = this.parseKey(obj[key])
        const arr = key.split('|')
        if (_.isPlainObject(obj)) {
          this.parseKey(value)
        }

        if (arr.length > 1) {
          let newKey = arr[0]
          let componentName = arr[1]
          let params = arr.slice(2)
          const component = {
            __componentName: componentName,
            __componentParams: params,
            ...value
          }

          params.forEach((param, index) => {
            component['__componentParam' + index] = param
          })
          obj[newKey] = obj[newKey] || []
          obj[newKey].push(component)
          delete obj[key]
        }
      })
    }
    return obj
  }
  restoreKey (data, parentKey, parentNode) {
    if (Array.isArray(data)) {
      let isComponent = false
      // const parentKey = paths.slice(paths.length - 1);
      data.forEach((item, index) => {
        if (_.isPlainObject(item) && item.__componentName) {
          isComponent = true

          let newKey = [parentKey, item.__componentName]
            .concat(item.__componentParams || []) // item.__componentParams 不存在 时[]
            .join('|')
          parentNode[newKey] = item

          delete item.__componentName
          if (item.__componentParams) {
            item.__componentParams.forEach((params, index) => {
              delete item['__componentParam' + index]
            })
            delete item.__componentParams
          }
        }
      })
      if (isComponent) {
        // const hjson = this.getNodeByPaths(paths.slice(0, paths.length - 1));
        // delete hjson.obj[paths[paths.length - 1]];
        delete parentNode[parentKey]
      }
    } else if (typeof data === 'object') {
      const keys = Object.keys(data)
      keys.forEach(key => {
        this.restoreKey(data[key], key, data)
      })
    }
  }
  setCommentJson (varName, json, pos) {
    let cloneJson = clone(json)
    this.restoreKey(cloneJson)
    let comment = Hjson.stringify(cloneJson, {
      // bracesSameLine: true,
      emitRootBraces: false,
      separator: true
    })
    comment = this.unwrapBrace(comment)
    this.setComment(varName, comment, pos)
    return this
  }
  getRootCommentJson (pos) {
    let hjson = this.getRootCommentHjson(pos)
    return hjson.obj
  }
  getRootCommentHjson (pos) {
    let comment = this.getRootComment(pos)
    let commentHjson = new HjsonData().parse(comment)
    this.parseKey(commentHjson.obj, [])
    return commentHjson
  }
  setRootCommentJson (json, pos) {
    let comment = Hjson.stringify(json, {
      // bracesSameLine: true,
      emitRootBraces: false,
      separator: true
    })
    comment = this.unwrapBrace(comment)
    this.setRootComment(comment, pos)
    return this
  }
  getRootComment (pos) {
    pos = pos || 'b'
    let r = this.comments.r
    if (!r) {
      return ''
    }
    if (!r[pos]) {
      return ''
    }
    return this.unwrapCommentSymbol(r[pos])
  }
  setRootComment (value, pos) {
    let rootComment = this.wrapCommentSymbol(value)
    this.comments.r = this.comments.r || {}
    this.comments.r.b = rootComment
    Hjson.comments.header(this.obj, rootComment)
    Hjson.comments.merge(this.comments, this.obj)
  }

  getComment (varName, pos) {
    pos = pos || 'b'

    let obj = this.obj
    let comments = this.comments

    if (Array.isArray(varName)) {
      const paths = varName.slice(0, varName.length)
      varName = paths.pop()
      const childHjson = this.getNodeByPaths(paths)
      obj = childHjson.obj
      comments = childHjson.comments
    }
    let varObj = null
    try {
      if (Array.isArray(obj)) {
        varObj = comments.x.a[varName]
      } else {
        varObj = comments.s[varName]
      }
    } catch (error) {
      debugger
    }

    if (!varObj) {
      return ''
    }
    if (varObj && !varObj[pos]) {
      return ''
    }

    return this.unwrapCommentSymbol(varObj[pos])
  }

  setComment (varName, value, pos) {
    let obj = this.obj
    let comments = this.comments

    if (Array.isArray(varName)) {
      const paths = varName.slice(0, varName.length)
      varName = paths.pop()
      const childHjson = this.getNodeByPaths(paths)
      obj = childHjson.obj
      comments = childHjson.comments
    }

    pos = pos || 'b'
    try {
      if (Array.isArray(obj)) {
        comments.x.a[varName] = comments.x.a[varName] || {}
        comments.x.a[varName][pos] = this.wrapCommentSymbol(value)
      } else {
        comments.s[varName] = comments.s[varName] || {}
        comments.s[varName][pos] = this.wrapCommentSymbol(value)
      }
    } catch (error) {
      debugger
    }
    Hjson.comments.merge(comments, obj)
    Hjson.comments.merge(this.comments, this.obj)

    return this
  }

  updateComment (varName, commentKey, commentValue, pos) {
    const commentJson = this.getCommentJson(varName)
    set(commentJson, commentKey, commentValue)
    // commentJson[commentKey] = commentValue;

    // this.setComment(varName, commentJson);
    this.setCommentJson(varName, commentJson)
  }

  updateCommentVar (varName, commentVarName, newCommentVarName) {
    const commentHjson = this.getCommentHjson(varName)
    commentHjson.setVar(commentVarName, newCommentVarName)
    this.setCommentJson(varName, commentHjson.obj)
  }

  appendComment (varName, value, pos) {
    let originValue = this.getComment(varName, pos)
    this.setComment(varName, originValue + value, pos)
    return this
  }

  prependComment (varName, value, pos) {
    let originValue = this.getComment(varName, pos)
    this.setComment(varName, value + originValue, pos)
    return this
  }

  getVar (varName) {
    if (Array.isArray(varName)) {
      const paths = varName.slice(0, varName.length)
      varName = paths.pop()
      return this.getNodeByPaths(paths).obj[varName]
    }
    return this.obj[varName]
  }

  setVar (varName, value, comment) {
    let obj = this.obj
    let comments = this.comments
    let varNameBak = varName

    if (Array.isArray(varName)) {
      const paths = varName.slice(0, varName.length)
      varName = paths.pop()
      const childHjson = this.getNodeByPaths(paths)
      obj = childHjson.obj
      comments = childHjson.comments
    }
    obj[varName] = _.isPlainObject(obj) ? objToHjson(value).obj : value

    if (comments.o.indexOf(varName) === -1) {
      comments.o.push(varName)
    }

    if (comment) {
      if (typeof comment === 'string') {
        this.setComment(varNameBak, comment) // 已合并不用在合并
      } else {
        this.setCommentJson(varNameBak, comment)
      }
    } else {
      // Hjson.comments.merge(comments, obj);
      Hjson.comments.merge(this.comments, this.obj)
    }
    return this
  }

  updateVar (varName, newVarName) {
    let obj = this.obj
    let comments = this.comments
    if (Array.isArray(varName)) {
      if (varName[varName.length - 1] === newVarName) return
      const paths = varName.slice(0, varName.length)
      varName = paths.pop()
      const childHjson = this.getNodeByPaths(paths)
      obj = childHjson.obj
      comments = childHjson.comments
    } else {
      if (varName === newVarName) return
    }

    const value = obj[varName]
    obj[newVarName] = value
    delete obj[varName]

    const commentsVarNameIndex = comments.o.indexOf(varName)

    const childComments = comments.s[varName]
    comments.s[newVarName] = childComments
    delete comments.s[varName]

    if (commentsVarNameIndex !== -1) {
      comments.o.splice(commentsVarNameIndex, 1, newVarName)
    }
    // Hjson.comments.merge(comments, obj);
    Hjson.comments.merge(this.comments, this.obj)
    return this
  }

  getHjsonCommentStruct () {
    return { s: {}, o: [], r: { b: '', x: {} } }
  }

  getNodeByPaths (paths) {
    let comments = (this.comments = this.comments || { s: {}, o: [], r: '' })
    let obj = this.obj

    for (let i = 0, len = paths.length; i < len; i++) {
      let key = paths[i]
      obj = obj[key]

      if (Array.isArray(obj)) {
        if (i < len - 1) {
          let key2 = paths[++i]
          obj = obj[key2]
          comments.s[key].x = comments.s[key].x || { a: [] }
          comments.s[key].x.a[key2] = comments.s[key].x.a[key2] || {
            b: '',
            x: {}
          }
          comments = comments.s[key].x.a[key2].x
        } else {
          comments = comments.s[key] || { x: { a: [] } }
        }
      } else {
        comments.s[key] = comments.s[key] || {}
        comments.s[key].x = comments.s[key].x || { s: {}, o: [] }
        comments = comments.s[key].x
      }

      // comments.s = comments.s || {};
      // comments.s[key] = comments.s[key] || { [key]: { b: '', x: {} } };
      // comments.s[key].x = comments.s[key].x || {};

      // if (Array.isArray(obj)) {
      //   if (i < len - 1) {
      //     let key2 = paths[++i];
      //     obj = obj[key2];
      //     comments.s[key].x = comments.s[key].x || { a: [] };
      //     comments.s[key].x.a[key2] = comments.s[key].x.a[key2] || { b: '', x: {} };
      //     comments = comments.s[key].x.a[key2].x;
      //   } else {
      //     comments = comments.s[key];
      //   }
      // } else {
      //   comments.s[key].x = comments.s[key].x || { s: {}, o: [] };
      //   comments = comments.s[key].x;
      // }
    }

    // let keys = [];
    // let currentKeys = Object.keys(obj);
    // if (comments && comments.o) {
    //   keys = [];
    //   comments.o.concat(currentKeys).forEach(key => {
    //     if (Object.prototype.hasOwnProperty.call(obj, key) && keys.indexOf(key) < 0) keys.push(key);
    //   });
    // } else {
    //   keys = currentKeys;
    // }
    // comments.o = keys;

    return { obj, comments }
  }
  ensureComments (paths) {
    let comments = (this.comments = this.comments || { s: {}, o: [], r: '' })
    let obj = this.obj

    for (let i = 0, len = paths.length; i < len; i++) {
      let key = paths[i]
      obj = obj[key]

      comments.s = comments.s || {}
      comments.s[key] = comments.s[key] || { [key]: { b: '', x: {} } }
      // comments.s[key].x = comments.s[key].x || {};

      if (Array.isArray(obj)) {
        let key2 = paths[++i]
        obj = obj[key2]
        comments.s[key].x = comments.s[key].x || { a: [] }
        comments.s[key].x.a[key2] = comments.s[key].x.a[key2] || {
          b: '',
          x: {}
        }
        comments = comments.s[key].x.a[key2].x
      } else {
        comments.s[key].x = comments.s[key].x || { s: {}, o: [] }
        comments = comments.s[key].x
      }
    }
  }

  wrapCommentSymbol (value) {
    return `${this.startCommentSymbol}
    ${value}
  ${this.endCommentSymbol}`
  }
  unwrapCommentSymbol (value) {
    let startCommentSymbol = this.startCommentSymbol.replace(
      /([\*\/\\])/g,
      '\\$1'
    )
    let endCommentSymbol = this.endCommentSymbol.replace(/([\*\/\\])/g, '\\$1')

    let newValue = value
      .replace(new RegExp(`^\\s*${startCommentSymbol}`), '')
      .replace(new RegExp(`${endCommentSymbol}\\s*$`), '')

    return newValue
  }
  unwrapBrace (value) {
    let newValue = value
      .replace(new RegExp(`^\\s*\\{`), '')
      .replace(new RegExp(`\\}\\s*$`), '')

    return `
      ${newValue}
    `
  }

  get (obj, keys) {
    let childObj = obj
    let lastValue
    if (Array.isArray(keys)) {
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          lastValue = childObj[key]
        } else {
          childObj = childObj[key]
        }
      })
      return lastValue
    } else {
      return obj[keys]
    }
  }
  set (obj, keys, value) {
    let childObj = obj
    if (Array.isArray(keys)) {
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          childObj[key] = value
        } else {
          if (typeof childObj[key] === 'undefined') {
            if (typeof keys[index + 1] === 'number') {
              childObj[key] = []
            } else {
              childObj[key] = {}
            }
          }
          childObj = childObj[key]
        }
      })
    } else {
      obj[keys] = value
    }
  }
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function set (obj, keys, value) {
  let childObj = obj
  if (Array.isArray(keys)) {
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        childObj[key] = value
      } else {
        if (typeof childObj[key] === 'undefined') {
          if (typeof keys[index + 1] === 'number') {
            childObj[key] = []
          } else {
            childObj[key] = {}
          }
        }
        childObj = childObj[key]
      }
    })
  } else {
    obj[keys] = value
  }
}

function get (obj, keys) {
  let childObj = obj
  let lastValue
  if (Array.isArray(keys)) {
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        lastValue = childObj[key]
      } else {
        childObj = childObj[key]
      }
    })
    return lastValue
  } else {
    return obj[keys]
  }
}

function objToHjsonStr (obj) {
  return jsonToHjsonStr(JSON.stringify(obj))
}
function objToHjson (obj) {
  const hj = new HjsonData().parse(JSON.stringify(obj))
  return hj
}
function jsonToHjsonStr (json) {
  const hj = new HjsonData().parse(json)
  return hj.stringify()
}

function hjsonStrToObj (hjson) {
  const hj = new HjsonData().parse(hjson)
  return hj.obj
}
function hjsonToObj (hjson) {
  return JSON.parse(JSON.stringify(hjson.obj))
}
function hjsonToHjsonStr (hjson) {
  return hjson.stringify()
}

module.exports = {
  HjsonData,
  objToHjsonStr,
  objToHjson,
  jsonToHjsonStr,
  hjsonStrToObj,
  hjsonToObj,
  hjsonToHjsonStr
}
