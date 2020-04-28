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
    const mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-mods.json")));
    let ans = await inquirer.prompt([
        {
            type: 'list',
            name: 'releaseType',
            message: chalk.red('Choose a release type:'),
            choices: [ "patch", "minor", "major" ]
        }
    ])
    cfg.version[ans.releaseType] += 1
    if (ans.releaseType === 'major')
        cfg.version.patch = cfg.version.minor = 0
    else if (ans.releaseType === 'minor')
        cfg.version.patch = 0
    fs.writeFileSync(path.join(root, 'modpack-project.json'), JSON.stringify(cfg, '\n', 2))
    logger.info(`Current version is ${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}`)
    await manager.build(includes)
    for (let mod of mods_cfg) {
        mod.old_version = mod.new_version
    }
    fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
}
