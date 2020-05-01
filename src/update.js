const fs = require('fs');
const path = require('path');
const { DownloaderHelper } = require('node-downloader-helper');
const makeDir = require('make-dir');
const logger = require('./logger');
const fetch = require('node-fetch');
const http = require('http');
const helpers = require('./helpers');

exports.default = async () => {
    const root = process.cwd();
    const mods = path.join(root,"mods");
    try {
        makeDir.sync(mods);//mods无法mkdir
    } catch (e) {
        logger.failure(e);
        process.exit();
    }

    logger.info(`Checking updates...`);
    let cache;
    try {
        cache = JSON.parse(fs.readFileSync(path.join(root,".modpack","cache.json")))
    } catch (e) {
        cache = {}
    }
    let mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-mods.json")))
    let cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-project.json")))
    if (!cfg.check_interval) {
        cfg.check_interval = 3 * 24 * 3600000 // 3 days
        fs.writeFileSync(path.join(root, 'modpack-project.json'), JSON.stringify(cfg, '\n', 2))
    }
    makeDir.sync(mods);
    let promises = []
    for (let mod of mods_cfg) {
        if (!cache[`m${addon_id}`])
            cache[`m${addon_id}`] = {}
        promises.push( download(mod, cfg, cache[`m${addon_id}`]) )
        if (promises.length > 4) {
            await Promise.allSettled(promises)
            promises = []
            fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
            fs.writeFileSync(path.join(root,".modpack","cache.json"), JSON.stringify(cache))
        }
    }
    if (promises.length > 0) {
        await Promise.allSettled(promises)
        fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
        fs.writeFileSync(path.join(root,".modpack","cache.json"), JSON.stringify(cache))
    }
}

async function download(mod, cfg, cache) {
    if (mod.strategy === 'none')
        return Promise.resolve()
    if ( mod.last_check && (new Date(cache.last_check).getTime() + cfg.check_interval) > new Date().getTime() ) {
        logger.info(`Skipping ${mod.name}...`)
        return Promise.resolve()
    }
    logger.info(`Fetching ${mod.name}...`)
    const content = await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/${mod.addon_id}/files`, helpers.options(cfg));
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
        if (new Date(f.fileDate) <= new Date(mod.date))
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
        logger.info(`${mod.name} is already up to date`)
        cache.last_check = new Date()
        return Promise.resolve()
    }
    all_files = all_files.sort((i,j)=>(new Date(i.fileDate).getTime() > new Date(j.fileDate).getTime()?-1:1))
    const file = all_files[0]
    mod.new_version = file.displayName
    const root = process.cwd();
    const mods = path.join(root,"mods");
    logger.info(`Downloading ${file.fileName}...`)
    const options = helpers.options(cfg)
    const dl = new DownloaderHelper(file.downloadUrl, mods, {
        httpRequestOptions: options,
        httpsRequestOptions: options,
        override: true
    });
    let new_version = file.displayName
    if (new_version.endsWith('.jar'))
        new_version = new_version.substring(0,new_version.length-4)
    return new Promise((resolve, reject) => {
        dl.on('end', () => {
            logger.success(`Download ${file.fileName} successfully!`);
            cache.date = file.fileDate
            mod.new_version = new_version
            cache.last_check = new Date()
            resolve()
        })
        dl.start();
    });
}
