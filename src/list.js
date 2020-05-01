const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, inlineLog, options } = require('./helpers');
const logger = require('./logger');

exports.default = async () => {
    const root = process.cwd();
    logger.info(`list mods in ${root}`);
    const mods_cfg = path.join(root,"modpack-mods.json");
    let cfg = JSON.parse(fs.readFileSync(mods_cfg,{encoding:"utf-8"}));
    console.log(chalk.green(`All ${cfg.length} mods!`));
    for (let i of cfg){
        console.log(chalk.yellow(i.name));
    }
}