const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const makeDir = require('make-dir');
const inquirer = require('inquirer')
exports.default = async () => {
    const root = process.cwd();
    console.log(chalk.blue(`[Crane]: init a modpack in ${root}`));
    //https://juejin.im/entry/5937c73cac502e0068cf1171
    let ans = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: chalk.red('What is your modpack name?'),
            default: "new modpack"
        },
        {
            type: 'input',
            name: 'mcversion',
            message: chalk.red('Which is your minecraft version?'),
            default: "1.12.2"
        },
        {
            type: 'input',
            name: 'author',
            message: chalk.red('Author?'),
            default: "cool guy"
        },
        {
            type: 'list',
            name: 'modloader',
            message: chalk.red('Which modloader do your like?'),
            default: 0,
            choices:["forge","fabric"]
        }
    ])
    ans.version = {
        major: 0,
        minor: 0,
        patch: 0
    }
    fs.writeFileSync(path.join(root, 'crane-project.json'), JSON.stringify(ans, '\n', 2))
    fs.writeFileSync(path.join(root, 'crane-mods.json'), JSON.stringify([], '\n', 2))
    fs.writeFileSync(path.join(root, 'crane-includes.json'), JSON.stringify([
      "mods",
      "config",
      "options.txt"
    ], '\n', 2))
    makeDir.sync(path.join(root, 'mods'))
    console.log('Done!')
}
