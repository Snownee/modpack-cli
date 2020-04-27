const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const makeDir = require('make-dir');
const inquirer = require('inquirer')
const logger = require('./logger');

exports.default = async () => {
    const root = process.cwd();
    logger.info(`Init a modpack in ${root}`);
    //https://juejin.im/entry/5937c73cac502e0068cf1171
    let ans = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: chalk.red('Modpack name?'),
            default: "new modpack"
        },
        {
            type: 'input',
            name: 'mcversion',
            message: chalk.red('Minecraft version?'),
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
            message: chalk.red('Modloader?'),
            default: 0,
            choices:["forge","fabric"]
        }
    ])
    ans.version = {
        major: 0,
        minor: 0,
        patch: 0
    }
    makeDir.sync(path.join(root, 'mods'))
    makeDir.sync(path.join(root, 'build'))
    makeDir.sync(path.join(root, 'modpack_includes'))
    fs.writeFileSync(path.join(root, 'modpack-project.json'), JSON.stringify(ans, '\n', 2))
    fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify([], '\n', 2))
    fs.writeFileSync(path.join(root, 'modpack_includes', 'default.json'), JSON.stringify(
    {
        files: [
            "mods",
            "config",
            "options.txt"
        ]
    }, '\n', 2))
    logger.success('Done!')
}
