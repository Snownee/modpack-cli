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
            default: "My Modpack"
        },
        {
            type: 'input',
            name: 'mcversion',
            message: chalk.red('Minecraft version?'),
            default: "1.12.2"
        },
        {
            type: 'input',
            name: 'compatible_versions',
            message: chalk.red('Compatible versions reg exp?'),
            default: ""
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
            choices: ["forge", "fabric"]
        }
    ])
    ans.version = {
        major: 0,
        minor: 0,
        patch: 0
    }
    ans.check_interval = 3 * 24 * 3600000 // 3 days
    ans.retry = { maxRetries: 2, delay: 3000 }
    ans.download_timeout = 20000
    ans.max_download_threads = 5
    makeDir.sync(path.join(root, 'mods'))
    makeDir.sync(path.join(root, 'build'))
    makeDir.sync(path.join(root, 'modpack_includes'))
    fs.writeFileSync(path.join(root, 'modpack-project.json'), JSON.stringify(ans, '\n', 2))
    fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify([], '\n', 2))
    fs.writeFileSync(path.join(root, 'modpack_includes', 'default.json'), JSON.stringify(
    {
        files: [
            "config",
            "openloader",
            "kubejs",
            "patchouli_books",
            "scripts",
            "defaultconfigs",
            "ma-essentials",
            "options.txt"
        ]
    }, '\n', 2))
    logger.success('Done!')
}
