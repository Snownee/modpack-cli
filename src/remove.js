const fs = require('fs');
const path = require('path');
const {DownloaderHelper} = require('node-downloader-helper');
const makeDir = require('make-dir');
const logger = require('./logger');
const fetch = require('node-fetch');
const http = require('http');
const helpers = require('./helpers');
const md5File = require('md5-file')
const inquirer = require('inquirer')
const chalk = require('chalk');

exports.default = async (mod_name) => {
    const root = process.cwd();
    const mods = path.join(root, "mods");
    let mods_cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack-mods.json")))
    let remove = [];
    for (let i of mods_cfg) {
        if (new RegExp(mod_name.toLowerCase()).test(i.name.toLowerCase())) {
            let files = fs.readdirSync(mods);
            for (let file of files) {
                let file_name = path.join(mods, file);
                if (fs.statSync(file_name).isFile()) {
                    if (md5File.sync(file_name) === i.md5) {
                        let ans = await inquirer.prompt([
                            {
                                type: 'list',
                                name: 'ok',
                                message: chalk.red(`Are you sure to remove ${i.name}?`),
                                choices: ["yes", "no"],
                                default: 0
                            }
                        ])
                        if (ans.ok === "yes") {
                            fs.unlinkSync(file_name);
                            logger.info(`delete file ${file}`);
                            remove.push(i.addon_id);
                        }
                    }
                }
            }
        }
        mods_cfg = mods_cfg.filter(i => remove.indexOf(i.addon_id) < 0);
        fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
    }
}
