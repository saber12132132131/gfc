const program = require('commander');

const helpOptions = () => {
  program.option('-w --why', 'a coderwhy option');

  program.option('-s --src <src>', 'a source folder');
  program.option('-d --dest <dest>', 'a destination folder, 例如: -d src/pages, 错误/src/pages');
  program.option('-f --framework <framework>', 'your framework name');
  program.option('-t --type <type>', 'your view routerType 有可选值 c 或 d c为静态路由，d为动态路由');
  program.option('-pr --parents <parents>', 'your view parent 父路由名');
  program.on('--help', function() {
  
  })
}

module.exports = helpOptions;