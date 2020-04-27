const fs = require('fs');
const path = require('path');
const { DownloaderHelper } = require('node-downloader-helper');
const makeDir = require('make-dir');
const logger = require('./logger');

exports.default = async () => {
    const root = process.cwd();
    const mods = path.join(root,"mods");
    try {
        makeDir.sync(mods);//mods无法mkdir
    } catch (e) {
        logger.failure(e);
        process.exit();
    }

    logger.info(`Install modpack in ${root}`);
    let mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-mods.json")))
    for (let i of mods_cfg){
        const dl = new DownloaderHelper(i.dl_url, mods,{override:true});
        dl.on('end', () => {
            logger.success(`Mod ${chalk.blue(i.name)} download succeed!`);
        })
        dl.start();
    }

}
