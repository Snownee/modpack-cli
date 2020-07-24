const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
const {DownloaderHelper} = require('node-downloader-helper');
const {byteHelper, inlineLog, options} = require('./helpers');
const logger = require('./logger');

exports.default = async (ext) => {
    const root = process.cwd();
    logger.info(`list mods in ${root}`);
    const mods_cfg = path.join(root, "modpack-mods.json");
    let cfg = JSON.parse(fs.readFileSync(mods_cfg, {encoding: "utf-8"}));
    let lines = []
    logger.success(chalk.green(`You have ${cfg.length} mod(s):`));
    if (!ext || ext === "table") {
        let output = cfg.map(mod => {
            return {
                Name: mod.name,
                Version: mod.new_version,
                Strategy: mod.strategy
            }
        })
        output.sort((a, b) => {
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
        })
        console.table(output)
    }
    if (ext === "md") {
        let output = cfg.map(mod => {
            return {
                Name: mod.name,
                url: mod.homepage || mod.downloadUrl || `https://www.curseforge.com/minecraft/mc-mods/${mod.slug}`
            }
        })
        output.sort((a, b) => {
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
        })

        console.log(output.map(i=>`[${i.Name}](${i.url})`).join("  \n"))
    }
    if (ext === "html") {
        let output = cfg.map(mod => {
            return {
                Name: mod.name,
                url: mod.homepage || mod.downloadUrl || `https://www.curseforge.com/minecraft/mc-mods/${mod.slug}`
            }
        })
        output.sort((a, b) => {
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
        })

        console.log("<ul>"+output.map(i=>`<li><a href="${i.url}">${i.Name}</a></li>`).join("  \n")+"</ul>");
    }
    if (ext === 'bbc') {
        let output = cfg.map(mod => {
            return {
                Name: mod.name,
                url: mod.homepage || mod.downloadUrl || `https://www.curseforge.com/minecraft/mc-mods/${mod.slug}`
            }
        })
        output.sort((a, b) => {
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
        })

        console.log("[list]"+output.map(i=>`[*][url=${i.url}]${i.Name}[/url]`).join("  \n")+"[/list]");
    }
}
