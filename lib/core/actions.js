const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const program = require('commander');
const downloadRepo = promisify(require('download-git-repo'));
const open = require('open');

const log = require('../utils/log');
const terminal = require('../utils/terminal');
const { ejsCompile, writeFile, mkdirSync ,writeToRoter,delFile,delView, changeRouter} = require('../utils/file');
const repoConfig = require('../config/repo_config');
const { timeLog } = require('console');

const createProject = async (project, otherArg) => {
  // 1.提示信息
  log.hint('lancerCli helps you create your project, please wait a moment~');

  // 2.clone项目从仓库
  await downloadRepo(repoConfig.tempRepo,  `./${project}`, { clone: true });
  
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
module.exports = {
  createProject,
  addComponent,
  addView,
  delViews,
  delComponent,
  addCview
}