const fs = require('fs');
const { promisify } = require('util');
fs.promises.write= promisify(fs.write);
const path = require('path');
const ejs = require('ejs');

const log = require('./log');

const ejsCompile = (templatePath, data={}, options = {}) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, {data}, options, (err, str) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(str);
    })
  })
}
const underlineToHump=(s)=>{
  var a = s.split("-");
  var result = a[0];
  for(var i=1;i<a.length;i++){
      result = result + a[i].slice(0,1).toUpperCase() + a[i].slice(1);
  }
  return result
}
const writeFile = (path, content) => {
  if (fs.existsSync(path)) {
    log.error("the file already exists~")
    return;
  }
  return fs.promises.writeFile(path, content);
}

const mkdirSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    // 不存在,判断父亲文件夹是否存在？
    if (mkdirSync(path.dirname(dirname))) {
      // 存在父亲文件，就直接新建该文件
      fs.mkdirSync(dirname)
      return true
    }
  }
}
const writeToRoter = async (path,content,type) => {
  let routerTxt =  await fs.promises.readFile(path,{
    encoding:"utf8",
    flag:"r+"
  })
  switch (type) {
    case "c":
      const index=routerTxt.indexOf("},")
      const bgtxt= routerTxt.slice(0,index+2)
      const endtxt= routerTxt.slice(index+2, routerTxt.length)
      const tagetTxt = bgtxt + content+endtxt
      return fs.promises.writeFile(path, tagetTxt,{
        flag:"w"
      });
      // 写入文件
      // console.log(fs.promises)
      // return fs.promises.write(result.fd,buff,0,buff.length,0)
      break;
    case "d":
      const index1=routerTxt.lastIndexOf("},")
      const bgtxt1= routerTxt.slice(0,index1+2)
      const endtxt1= routerTxt.slice(index1+2, routerTxt.length)
      const tagetTxt1 = bgtxt1 + content+endtxt1
      return fs.promises.writeFile(path, tagetTxt1,{
        flag:"w"
      })
      break;
    default:
      break;
  }
 
}

const delFile = (path, reservePath)=> {
  if (fs.existsSync(path)) {
      if (fs.statSync(path).isDirectory()) {
          let files = fs.readdirSync(path);
          files.forEach((file, index) => {
              let currentPath = path + "/" + file;
              if (fs.statSync(currentPath).isDirectory()) {
                  delFile(currentPath, reservePath);
              } else {
                  fs.unlinkSync(currentPath);
              }
          });
          if (path != reservePath) {
              fs.rmdirSync(path);
          }
      } else {
          fs.unlinkSync(path);
      }
  }
}
const  delView = async (path,content)=> {
  let routerTxt =  await fs.promises.readFile(path,{
    encoding:"utf8",
    flag:"r+"
  })
 const beginIndex= routerTxt.indexOf(content)
 const beginTxt = routerTxt.substring(0,beginIndex)
 const endIndex = routerTxt.lastIndexOf(content)
 const endTxt = routerTxt.substring(endIndex+content.length)
 const targetTxt= beginTxt+ endTxt
 return fs.promises.writeFile(path, targetTxt,{
  flag:"w"
})
}
const  changeRouter =async (name,result,type,path)=> {
  let routerTxt =  await fs.promises.readFile(path,{
    encoding:"utf8",
    flag:"r+"
  })

 const beginIndex= routerTxt.indexOf(name)
 const beginTxt = routerTxt.substring(0,beginIndex)
 const endTxt = routerTxt.substring( beginIndex,routerTxt.length)
 const firstTxt=  endTxt.substring(0,endTxt.indexOf("},")+2)
 const secondTxt=  endTxt.substring(endTxt.indexOf("},")+2,endTxt.length)

  const targetTxt=beginTxt+firstTxt+result+secondTxt

 return fs.promises.writeFile(path, targetTxt,{
  flag:"w"
})
}
module.exports = {
  ejsCompile,
  writeFile,
  mkdirSync,
  writeToRoter,
  delFile,
  delView,
  changeRouter,
  underlineToHump
}