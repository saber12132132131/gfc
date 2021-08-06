const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const axios = require('axios');
const program = require('commander');
const downloadRepo = promisify(require('download-git-repo'));
const open = require('open');

const log = require('../utils/log');
const terminal = require('../utils/terminal');
const { ejsCompile, writeFile, mkdirSync ,writeToRoter,delFile,delView, changeRouter,underlineToHump} = require('../utils/file');
const repoConfig = require('../config/repo_config');
const { timeLog } = require('console');

const createProject = async (project, isNew) => {
 
  // 1.提示信息
  log.hint('lancerCli helps you create your project, please wait a moment~');

  // 2.clone项目从仓库
  if(isNew){
    await downloadRepo(repoConfig.newRepo,  `./${project}`, { clone: true });
  }else{
    await downloadRepo(repoConfig.tempRepo,  `./${project}`, { clone: true });
  }
 
  
  // 3.执行终端命令npm install
  // terminal.exec('npm install', {cwd: `./${project}`});
  // const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  // await terminal.spawn(npm, ['install'], { cwd: `./${project}` });
}
const handleEjsToFile = async (name, dest, template, filename) => {
  // 1.获取模块引擎的路径
  const templatePath = path.resolve(__dirname, template);
  const result = await ejsCompile(templatePath, {name, lowerName: name.toLowerCase()});
  // 2.写入文件中
  // 判断文件不存在,那么就创建文件
  mkdirSync(dest);
  const targetPath = path.resolve(dest, filename);
  writeFile(targetPath, result);
}
const  handleViewToRoter =async (name,dest,template,type) => {
  // 路由为固定路径
    const roterPath = path.resolve("./src/router/index.js");
    // 模板路径地址
    const templatePath = path.resolve(__dirname, template);
    // 组件路径地址
    const compPath=dest.replace(/src/i,"@")+`/index.vue`
    // 生成的模板
    const result = await ejsCompile(templatePath, {name, lowerName: name.toLowerCase(),path:compPath});
    writeToRoter(roterPath,result,type)
  //  判断是静态路由还是动态路由  
}
const  delViewFromRouter = async (name,dest,template)=>{
    const roterPath = path.resolve("./src/router/index.js");
    const templatePath = path.resolve(__dirname, template);
    const compPath=dest.replace(/src/i,"@")+`/index.vue`
    const result = await ejsCompile(templatePath, {name, lowerName: name.toLowerCase(),path:compPath});
    delView(roterPath,result)
}
const  handleChangeRouter = async (name,parents,type)=>{
    const roterPath = path.resolve("./src/router/index.js");
    const templatePath = path.resolve(__dirname,'../template/router.child.ejs');
    const compPath=parents.replace(/src/i,"@")+`/${name}.vue`
    const result = await ejsCompile( templatePath, {name, lowerName: name.toLowerCase(),path:compPath});
    changeRouter(parents.replace(/src/i,"@"),result,type,roterPath)
}
const addComponent =  async (name, dest) => {
  handleEjsToFile(name, dest, '../template/component.vue.ejs', `index.vue`);
}
const  addView =  async (name, dest,type) => {
 // 在view中添加页面
  handleEjsToFile(name, dest, '../template/component.vue.ejs', `index.vue`); 
 // 在roter中添加路由
  handleViewToRoter(name,dest, '../template/router.vue.ejs',type)
}
const  delViews =  async (name,dest) => {
  // 删除文件夹
  const delpath =path.resolve(dest)
  if(fs.existsSync(delpath)){
    delFile(delpath)
    // 删除路由中的配置数据
    delViewFromRouter(name,dest,'../template/router.vue.ejs')
  }else{
    log.error("the file not exists~")
  }

 }
 const delComponent = async (name,dest) => {
  // 删除文件夹
  const delpath =path.resolve(dest)
  if(fs.existsSync(delpath)){
    delFile(delpath)
  }else{
    log.error("the file not exists~")
  }

 }
 const addCview = async (name,parents,type) => {
    // 判断父路由是否输入
        if(parents==undefined){
          log.error("please enter parent router")
          return
        }
       const parentPath=path.resolve(parents)
       if(fs.existsSync(parentPath)){
        //  view中添加新路由文件
        handleEjsToFile(name, parents, '../template/component.vue.ejs', `${name}.vue`); 
        //  修改router/index.js的路由配置
         handleChangeRouter(name,parents,type)
       }else{
        log.error("the parent router not exists~")
        return
       }

       
    // 
      
 }
 const addConfig= async (name,dests) => {
  const dest=path.resolve(dests)
  console.log(fs.existsSync(dest))
  if(!fs.existsSync(dest)){
    handleEjsToFile(name, dest, '../template/table.field.ejs', `${name}.field.js`); 
    handleEjsToFile(name, dest, '../template/form.field.ejs', `${name}.form.js`); 
  }else{
    log.error("config  exists~")
    return
   }
    
}
 const delConfig= async (name,dests) => {
  // 删除文件夹
  const delpath =path.resolve(dests)
  if(fs.existsSync(delpath)){
    delFile(delpath)
  }else{
    log.error("the file not exists~")
  }
    
}
 const addApi= async (name,dests) => {
  const dest=path.resolve(dests)
  handleEjsToFile(name, dest, '../template/api.ejs', `${name}.api.js`); 
}
 const addTable= async (name, dest,type) => {
  // 在view中添加页面
   handleEjsToFile(name, dest, '../template/component.table.ejs', `index.vue`); 
  // 在roter中添加路由
   handleViewToRoter(name,dest, '../template/router.vue.ejs',type)
 }
 const genApi= async (url,noBaseUrl) => {
    const result = await axios.get(url)
    console.log
    const object = result.data.paths
    const templatePath = path.resolve(__dirname,'../template/req.ejs');
    const objArr={}
    const tagsArray=[]
    for (const key in object) {
      if (Object.hasOwnProperty.call(object, key)) {
        const reqName = key.split("/")[key.split("/").length-1]
        const element = object[key];
        const methods = Object.keys(element)[0]
        const resultPop = await ejsCompile(templatePath, {reqName:reqName,url:`${noBaseUrl?"":result.data.basePath}${key}`,method:methods.toUpperCase(),note:element[methods].summary});
        if(tagsArray.includes(element[methods].tags[0])){
           objArr[element[methods].tags].push(resultPop)
        }else{
          objArr[element[methods].tags]=[]
          tagsArray.push(element[methods].tags[0])
          objArr[element[methods].tags].push(resultPop)
        }
      }
    }
 
    for (const key in objArr) {
      if (Object.hasOwnProperty.call(objArr, key)) {
        const element = objArr[key];
        const fileName = `${underlineToHump(key)}.api.js`
        const delpath =path.resolve(`src/api/${fileName}`)
        // 删除原有文件夹
        if(fs.existsSync(delpath)){
          delFile(delpath)
        }
        mkdirSync(`src/api/`);
        const targetPath = path.resolve(`src/api/`, fileName);

const targetTxt =`import request from '@/utils/request'

${objArr[key].join("\n")}
`
        writeFile(targetPath,targetTxt);
      }
    }
    
 }
module.exports = {
  createProject,
  addComponent,
  addView,
  delViews,
  delComponent,
  addCview,
  addConfig,
  delConfig,
  addApi,
  addTable,
  genApi
}