const program = require('commander');

const {
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
} = require('./actions');

const createCommands = () => {
  // 创建项目指令
  program
    .command('create <project> [-new]')
    .description('clone a repository into a newly created directory')
    .action(project=>createProject(project,program.isNew));
  program
    .command('addcpn <name>')
    .description('add vue component, 例如: gfc addcpn NavBar [-d src/components]')
    .action(name => addComponent(name, program.dest || `src/components/${name.toLowerCase()}`))
  program
    .command('addview <name>')
    .description('add vue view, 例如: gfc addview Home [-d dest] [-t type]')
    .action(name => {
      addView(name, program.dest || `src/views/${name.toLowerCase()}`, program.type || "c")
    })
  program
    .command('delview <name>')
    .description('del vue view, 例如: gfc delview Home')
    .action(name => {
      delViews(name, program.dest || `src/views/${name.toLowerCase()}`)
    })
  program
    .command('delcpn <name>')
    .description('del vue component, 例如: gfc delview Home')
    .action(name => delComponent(name, program.dest || `src/components/${name.toLowerCase()}`))
  program
    .command('addCview <name>')
    .description('add child view, 例如: gfc delCview Home  [-pr parent] [-t type]')
    .action(name => addCview(name, `src/views/${program.parents.toLowerCase()}`, program.type || "c"))
  program
    .command('addConfig <name>')
    .description('add config, 例如: gfc addConfig table')
    .action(name => addConfig(name, `src/config/${name.toLowerCase()}`))
  program
    .command('delConfig <name>')
    .description('del config, 例如: gfc delConfig table')
    .action(name => delConfig(name, `src/config/${name.toLowerCase()}`))
  program
    .command('addApi <name>')
    .description('add Api, 例如: gfc addApi table')
    .action(name => addApi(name, `src/api`))
  program
    .command('addTable <name>')
    .description('addTable , 例如: gfc addTable table')
    .action(name => {
      addTable(name, program.dest || `src/views/${name.toLowerCase()}`, program.type || "c")
    })
  program
    .command('genApi [-url url] [-no]')
    .description('genApi , 例如: genApi -url www.test.com')
    .action(() => {
      genApi(program.url,program.nobaseurl)
    })
}

module.exports = createCommands;