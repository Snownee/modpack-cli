const fs = require('fs');
const path = require('path');
const { DownloaderHelper } = require('node-downloader-helper');
const makeDir = require('make-dir');
const logger = require('./logger');
const fetch = require('node-fetch');
const http = require('http');

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
    let mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-mods.json")))
    let cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-project.json")));
    makeDir.sync(mods);
    for (let mod of mods_cfg){
        await download(mod, cfg)
    }
    console.log(mods_cfg);
    fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
}

async function download(mod, cfg) {
    if (mod.strategy === 'none')
        return Promise.resolve()
    logger.info(`Fetching ${mod.name}...`)
    const content = await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/${mod.addon_id}/files`);
    let all_files = await content.json();
    logger.info(`Sorting ${mod.name}...`)
    all_files = all_files.filter(f => {
        if (!f.isAvailable)
            return false
        // 1: R 2: B 3: A
        const strategies = ['beta', 'alpha']
        const strategy_id = strategies.indexOf(mod.strategy) + 2;
        if (f.releaseType > strategy_id)
            return false
        if (new Date(f.fileDate).getTime() <= new Date(mod.date))
            return false
        if (!f.gameVersion.includes(cfg.mcversion))
            return false
        if (cfg.modloader === 'forge') {
            if (f.fileName.toLowerCase().includes('fabric'))
                return false
            if (f.gameVersion.includes('Fabric') && !f.gameVersion.includes('Forge'))
                return false
        } else if (cfg.modloader === 'fabric') {
            if (f.fileName.toLowerCase().includes('forge'))
                return false
            if (f.gameVersion.includes('Forge') && !f.gameVersion.includes('Fabric'))
                return false
        }
        return true
    })
    if (all_files.length === 0) {
        logger.info(`${mod.name} has no updates`)
        return Promise.resolve()
    }
    all_files = all_files.sort((i,j)=>(new Date(i.fileDate).getTime() > new Date(j.fileDate).getTime()?-1:1))
    const file = all_files[0]
    mod.new_version = file.displayName
    const root = process.cwd();
    const mods = path.join(root,"mods");
    logger.info(`Downloading ${file.fileName}...`)
    const options = require('./helpers').options(cfg)
    const dl = new DownloaderHelper(file.downloadUrl, mods, {
        httpRequestOptions: options,
        httpsRequestOptions: options,
        override: true
    });
    return new Promise((resolve, reject) => {
        dl.on('end', () => {
            logger.success(`Download ${file.fileName} successfully!`);
            mod.date = file.fileDate
            mod.new_version = file.displayName
            resolve()
        })
        dl.start();
    });
}
