const program = require('commander');

const {
  createProject,
  addComponent,
  addView,
  delViews,
  delComponent
} = require('./actions');

const createCommands = () => {
  // 创建项目指令
  program
    .command('create <project> [otherArgs...]')
    .description('clone a repository into a newly created directory')
    .action(createProject);
  program
    .command('addcpn <name>')
    .description('add vue component, 例如: gfc addcpn NavBar [-d src/components]')
    .action(name => addComponent(name, program.dest || `src/components/${name.toLowerCase()}`))
  program
    .command('addview <name>')
    .description('add vue view, 例如: gfc addview Home [-d dest] [-t type]')
    .action(name => {
      addView(name, program.dest || `src/views/${name.toLowerCase()}`,program.type||"c")
    })
  program
    .command('delview <name>')
    .description('del vue view, 例如: gfc delview Home')
    .action(name => {
      delViews(name,program.dest || `src/views/${name.toLowerCase()}`)
    })
  program
    .command('delcpn <name>')
    .description('del vue component, 例如: gfc delview Home')
    .action(name => delComponent(name, program.dest || `src/components/${name.toLowerCase()}`))
}

module.exports = createCommands;