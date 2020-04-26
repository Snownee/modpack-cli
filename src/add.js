const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const curse = require("mc-curseforge-api");
var inquirer = require('inquirer')
const { DownloaderHelper } = require('node-downloader-helper');

exports.default = async (name) => {
    const root = process.cwd();
    const mods = path.join(process.cwd(),"mods");
    const manifest = path.join(process.cwd(),"manifest.json");
    console.log(chalk.blue(`[Crane]: add mod ${name} in ${root}`));
    if (!fs.existsSync(manifest)){
        console.log(chalk.red(`[Crane]: could not found manifest.json in ${root}, please use ${chalk.blue('crane init')} first!`));
        process.exit(0);
    }
    let fest = JSON.parse(fs.readFileSync(manifest,{encoding:"utf-8"}));//Json parse失败
    await makeDir(mods);//mods无法mkdir
    if (fest.minecraft===undefined || fest.minecraft.version === undefined){
        console.log(chalk.red(`[Crane]: manifest.json do not have minecraft version!`));
        process.exit(0);
    }
    let version = fest.minecraft.version;
    let mod;
    if (/\d+/.test(name)){
        mod = await curse.getMod(name);
    }
    else {
        let mods_list = await curse.getMods({searchFilter: "cuisine"})
        let que = [];
        for (let i of mods_list) {
            que.push(`mod name:${i.name},author ${i.authors[0].name}`)
        }
        let ans = await inquirer.prompt([
            {
                type: 'list',
                name: 'mod',
                message: chalk.red('Which mod do your want?'),
                default: 0,
                choices: que
            }
        ])
        let index = que.findIndex((i) => i === ans.mod);
        mod = mods_list[index];
    }
    let mods_list = [];
    let mod_file_infos = [];
    for (let i of mod.latestFiles){
        console.log(i)
        let is_ok = i.minecraft_versions.filter((j)=>j===version);
        if (is_ok){
            mods_list.push(i);
            mod_file_infos.push(`name: ${i.displayName} date: ${i.fileDate}`)
        }
    }
    ans = await inquirer.prompt([
        {
            type: 'list',
            name: 'mod',
            message: chalk.red('Which mod version do your want?'),
            default: 0,
            choices:mod_file_infos
        }
    ])
    index = mods_list.findIndex((i)=>i===ans.mod);
    let file = mod_files[index];
    const dl = new DownloaderHelper(file.downloadUrl, mods);
    dl.on('end', () => console.log(chalk.green(`[Crane]: mod ${mod.name} install succeed!`)))
    await dl.start();
}
