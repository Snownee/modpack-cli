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
    let lines = []
    logger.success(chalk.green(`You have ${cfg.length} mod(s):`));
    let output = cfg.map(mod => { return {
        Name: mod.name,
        Version: mod.new_version,
        Strategy: mod.strategy
    } } )
    output.sort( (a, b) => {
        let nameA = a.Name.toUpperCase(); // ignore upper and lowercase
        let nameB = b.Name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
    } )
    console.log(output);
    console.table(output)
}
