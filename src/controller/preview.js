const Base = require('./base.js');
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const mkdirp = require('mkdirp');

nunjucks.configure({
  autoescape: false,
  tags: {
    blockStart: '<%',
    blockEnd: '%>',
    variableStart: '<$',
    variableEnd: '$>',
    commentStart: '<#',
    commentEnd: '#>'
  }
});

module.exports = class extends Base {
  async indexAction(){
    return this.display();
  }

  async appAction(){
    return this.display();
  }

  async pageidAction(){
    let data = this.getReqData();
    let pageData = await getPageData.bind(this)(data.id);
    let path = pageData.path;
    let templateId = pageData.template_id;
    let appId = pageData.app_id;
    let pageId = pageData.id;

    let previewUrl = this.buildPreviewUrl(path, templateId, appId, pageId);
    return this.success({url: previewUrl});
  }

  async preview(path, templateId, appId, pageId){

    let renderTemplateOption = {
      templateId: templateId,
      appId: appId,
      pageId: pageId,
    };
    let previewFile = getPreviewFile(path);

    let outputRenderTemplate = await renderTemplate.bind(this)(renderTemplateOption);

    let previewTemplate = prettierTemplate(outputRenderTemplate);

    await buildPreviewFile(previewFile, previewTemplate);

    return getPreviewurl(path);
  }

  async buildPreviewUrl(pageId){

    let pageData = await getPageData.bind(this)(pageId);
    let path = pageData.path;
    let templateId = getTemplateId(pageData);
    let appId = pageData.app_id;

    let renderTemplateOption = {
      templateId: templateId,
      appId: appId,
      pageId: pageId,
    };
    let appData = await getAppData.bind(this)(appId);
    let scaffoldData = await getScaffoldData.bind(this)(appData.scaffold_id);
    let previewFile = getPreviewFile(path, scaffoldData);

    let outputRenderTemplate = await renderTemplate.bind(this)(renderTemplateOption);

    let previewTemplate = prettierTemplate(outputRenderTemplate);

    await buildPreviewFile(previewFile, previewTemplate);

    let routerFile = getRouterFile(scaffoldData);
    let menuFile = getMenuFile(scaffoldData);
    let routerTemplate = scaffoldData.router_template;
    let menuTemplate = scaffoldData.menu_template;
    // let routerTemplate = renderRouter(routerFile, appData.page);
    // let menuTemplate = renderMenu(menuFile, appData.page);
    await buildTemplateFile(routerFile, routerTemplate);
    await buildTemplateFile(menuFile, menuTemplate);

    return getPreviewurl(path, scaffoldData);
  }

  async pageAction() {
    let data = this.getReqData();
    let user = await this.session('userInfo');
    let pageData = data;
    let pageId = data.id;

    let path = pageData.path;
    let templateId = getTemplateId(pageData);
    let appId = pageData.app_id;

    let renderTemplateOption = {
      templateId: templateId,
      appId: appId,
      pageId: pageId,
    };

    if(!pageId){
      renderTemplateOption.pageData = pageData;
    }
    let appData = await getAppData.bind(this)(appId);
    let scaffoldData = await getScaffoldData.bind(this)(appData.scaffold_id);
    let previewFile = getPreviewFile(path, scaffoldData);

    let outputRenderTemplate = await renderTemplate.bind(this)(renderTemplateOption);

    let previewTemplate = prettierTemplate(outputRenderTemplate);

    await buildPreviewFile(previewFile, previewTemplate);

    let previewUrl = getPreviewurl(path, scaffoldData);

    return this.success({url: previewUrl});
  }

};

function getTemplateId(data){
  return data.template_id || data.page_template[0].template_id;
}

function getPreviewFile(path, scaffoldData){
  var dirname = __dirname;
  var scaffoldDir = dirname + '/../../../scaffold/' + scaffoldData.name;
  var previewFile = scaffoldDir + '/' + scaffoldData.page_dir + '/' + path + '.js';
  // previewFile = path.normalize(previewFile);
  return previewFile
}
function getRouterFile(scaffoldData){
  var dirname = __dirname;
  var scaffoldDir = dirname + '/../../../scaffold/' + scaffoldData.name;
  var routerFile = scaffoldDir + '/' + scaffoldData.router_file_path;
  return routerFile
}
function getMenuFile(scaffoldData){
  var dirname = __dirname;
  var scaffoldDir = dirname + '/../../../scaffold/' + scaffoldData.name;
  var menuFile = scaffoldDir + '/' + scaffoldData.menu_file_path;
  return menuFile
}

function getPreviewurl(path, scaffoldData){
  return '/scaffold/' + scaffoldData.name + '/#/' + path;
}


function extraFieldToMap(data){
  let pageTemplateData = data.page_template;
  let pageComponentData = data.page_component;

  pageTemplateData.forEach(item => {
    if(typeof item.content == 'string'){
      item.content = JSON.parse(item.content);
    }
    data.extraFieldMap = arrToMap(item.content.extra_field, 'name');
    data.fieldsMap = arrToMap(item.content.fields, 'name');
  });

  pageComponentData.forEach(item => {
    if(typeof item.content == 'string'){
      item.content = JSON.parse(item.content);
    }
    item.content.extraFieldMap = arrToMap(item.content.extra_field, 'name');
  });


  return data;
}



/**
 * 页面预览可能没有页面id所以需要传pageData
 */
async function renderTemplate(options){

  let templateId = options.templateId;
  let appId = options.appId;
  let pageId = options.pageId;
  let pageData = options.pageData;

  let templateInfo = await getTemplateData.bind(this)(templateId);
  let inputTemplate = templateInfo.template;

  let appData = await getAppData.bind(this)(appId);

  pageData = pageData ? pageData : await getPageData.bind(this)(pageId);
  //转为map
  pageData = extraFieldToMap(pageData);

  let scaffoldData = await getScaffoldData.bind(this)(appData.scaffold_id);
  let layoutData = await getLayoutData.bind(this)(appData.layout_id);
  let interAppData = await getInterAppData.bind(this)(appData.inter_app_id);
  let componentListData = await getComponentListData.bind(this)();
  let validListData = await getValidListData.bind(this)();
  let inputData = {
    appData: {},
    pageData: pageData,
    scaffoldData: scaffoldData,
    layoutData: layoutData,
    interAppData: interAppData,
    componentListData: componentListData,
    validListData: validListData,
    renderComponent: function(componentInputData){
      let componentName = componentInputData.type;
      let component = getComponentByName(componentName, componentListData);
      return renderComponent(componentInputData, component);
    },
    renderComponentAll: function(){
      var str = '';
      pageData.page_component.forEach(item => {
        let componentId = item.component_id || item.content.id;
        let component = getComponentById(componentId, componentListData);
        let componentInputData = item.content;
        componentInputData.renderExtraField = function(extraField){
          return renderExtraField(extraField, componentData)
        }

        str += renderComponent(componentInputData, component);
      });
      return str;
    },
    renderCustomTemplate: function(){
      var str = '';
      pageData.page_template.forEach(item => {
        item.content.fields.forEach(item => {
          let componentName = item.type || 'input';
          let component = getComponentByName(componentName, componentListData);
          let componentInputData = item;
          componentInputData.renderExtraField = function(extraField){
            return renderExtraField(extraField, componentData)
          }

          str += renderComponent(componentInputData, component);
        });
      });
      return str;
    }
  };

  let outputTemplate = nunjucks.renderString(inputTemplate, inputData);
  return outputTemplate;
}

function renderComponent(componentInputData, component){
  let template = nunjucks.renderString(component.template, {data: componentInputData});
  return template;
}

function renderExtraField(extraField, componentListData){
  let componentId = extraField.component_id;
  let component = getComponentById(componentId, componentListData);
  let template = nunjucks.renderString(component.template, componentInputData);
  return template;
}

function renderRouter(routerTemplateFile, routerData){
  var routerTemplate = fs.readFileSync(routerTemplateFile).toString();
  let template = nunjucks.renderString(routerTemplate, {routerData: routerData});
  return template;
}

function renderMenu(menuTemplateFile, menuData){
  var menuTemplate = fs.readFileSync(menuTemplateFile).toString();
  let template = nunjucks.renderString(menuTemplate, {menuData: menuData});
  return template;
}

function getComponentById(id, componentList){

  let component = componentList.find(item => item.id == id);
  if(component){
    return component;
  }

  console.error('没有此组件：', id);
  return {};
}

function getComponentByName(name, componentList){

  let component = componentList.find(item => item.name == name);
  if(component){
    return component;
  }

  console.error('没有此组件：', name);
  return {};
}

async function getTemplateData(id){
  let data = await this.model('template').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}
async function getAppData(id){
  let data = await this.model('app').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}

async function getPageData(id){
  let data = await this.model('page').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}

async function getScaffoldData(id){
  let data = await this.model('scaffold').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}
async function getLayoutData(id){
  let data = await this.model('layout').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}
async function getInterAppData(id){
  let data = await this.model('inter_app').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}
async function getComponentData(id){
  let data = await this.model('component').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}
async function getComponentListData(id){
  let data = await this.model('component').list(1, 10000);
  data = sqlJsonToCommonJson(data.data);
  return data;
}
async function getValidData(id){
  let data = await this.model('valid').info(id);
  data = sqlJsonToCommonJson(data);
  return data;
}
async function getValidListData(id){
  let data = await this.model('valid').list(1, 10000);
  data = sqlJsonToCommonJson(data.data);
  return data;
}


async function buildPreviewFile(filePath, template){
  let dir = path.dirname(filePath);
  return new Promise((resolve, reject) => {
    mkdirp(dir, function (err) {
        if (err) console.error(err)

        resolve();
        fs.writeFileSync(filePath, template);
    });
  });
}

async function buildTemplateFile(filePath, template){
  let dir = path.dirname(filePath);
  return new Promise((resolve, reject) => {
    mkdirp(dir, function (err) {
        if (err) console.error(err)

        resolve();
        fs.writeFileSync(filePath, template);
    });
  });
}

function prettierTemplate(template){
  let prettierTemplate = prettier.format(template, {
    semi: true,
    jsxBracketSameLine: true,
  });
  return prettierTemplate;
}

function sqlJsonToCommonJson(data){
  data = JSON.stringify(data);
  data = JSON.parse(data);
  return data;
}

function arrToMap(arr, key){
  var map = {};
  key = key || 'id';
  arr.forEach(item => {
    map[item[key]] = item;
  });
  return map;
}

function getTemplate(templateData, componentList){
  var template = '';
  var appData = null;
  var pageData = null;
  var scaffoldData = null;
  var layoutData = null;
  var interData = null;
  var templateData = null;
  var componentData = null;
  var validData = null;
  templateData.fields.forEach(itemData => {
    componentList.forEach(componentItem => {
      if(itemData.type == componentItem.name){
        template += nunjucks.renderString(componentItem.template, {data: itemData});
      }
    });
  });
  return template;
}
