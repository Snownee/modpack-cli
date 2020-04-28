const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const makeDir = require('make-dir');
const inquirer = require('inquirer')
const logger = require('./logger');
const manager = require("./mod");

exports.default = async (includes) => {
    const root = process.cwd();
    const cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-project.json")));
    let ans = await inquirer.prompt([
        {
            type: 'list',
            name: 'releaseType',
            message: chalk.red('Choose a release type:'),
            choices: [ "patch", "minor", "major" ]
        }
    ])
    cfg.version[ans.releaseType] += 1
    fs.writeFileSync(path.join(root, 'modpack-project.json'), JSON.stringify(cfg, '\n', 2))
    logger.info(`Current version is ${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}`)
    await manager.build(includes)
}
