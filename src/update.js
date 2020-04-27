const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { DownloaderHelper } = require('node-downloader-helper');
const makeDir = require('make-dir');

exports.default = async () => {
    const root = process.cwd();
    const mods = path.join(root,"mods");
    try {
        await makeDir(mods);//mods无法mkdir
    }catch (e) {
        console.log(chalk.red(e));
        process.exit();
    }

    console.log(chalk.blue(`[Crane]: install a modpack in ${root}`));
    let mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-mods.json")))
    for (let i of mods_cfg){
        const dl = new DownloaderHelper(i.dl_url, mods,{override:true});
        dl.on('end', () => {
            console.log(chalk.green(`[Crane]: mod ${chalk.blue(i.name)} download succeed!`));
        })
        dl.start();
    }

}