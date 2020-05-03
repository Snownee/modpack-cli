const fs = require('fs');
const path = require('path');
const {DownloaderHelper} = require('node-downloader-helper');
const makeDir = require('make-dir');
const logger = require('./logger');
const fetch = require('node-fetch');
const http = require('http');
const helpers = require('./helpers');
const md5File = require('md5-file')

exports.default = async (mod_name, force) => {
    const root = process.cwd();
    const mods = path.join(root, "mods");
    try {
        makeDir.sync(mods);//mods无法mkdir
    } catch (e) {
        logger.failure(e);
        process.exit();
    }

    logger.info(`Checking updates...`);
    let cache;
    makeDir.sync(".modpack");
    try {
        cache = JSON.parse(fs.readFileSync(path.join(root, ".modpack", "cache.json")))
    } catch (e) {
        cache = {}
    }
    let mods_cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack-mods.json")))
    let cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack-project.json")))
    if (!cfg.check_interval) {
        cfg.check_interval = 3 * 24 * 3600000 // 3 days
        fs.writeFileSync(path.join(root, 'modpack-project.json'), JSON.stringify(cfg, '\n', 2))
    }
    makeDir.sync(mods);
    let promises = []
    for (let mod of mods_cfg) {
        if (!cache[`m${mod.addon_id}`])
            cache[`m${mod.addon_id}`] = {}
        if (!mod_name) {
            promises.push(download(mod, cfg, cache[`m${mod.addon_id}`], force))
        } else if (new RegExp(mod_name).test(mod.name)) {
            let cfg_cpy = {...cfg};
            cfg_cpy.check_interval = 0;
            promises.push(download(mod, cfg_cpy, cache[`m${mod.addon_id}`], force))
        }
        if (promises.length >= 5) {
            await Promise.allSettled(promises)
            promises = []
            fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
            fs.writeFileSync(path.join(root, ".modpack", "cache.json"), JSON.stringify(cache))
        }
    }
    if (promises.length > 0) {
        await Promise.allSettled(promises)
        fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
        fs.writeFileSync(path.join(root, ".modpack", "cache.json"), JSON.stringify(cache))
    }
}

async function download(mod, cfg, cache, force) {
    let file = {};
    const root = process.cwd();
    const mods = path.join(root, "mods");
    if (mod.downloadUrl) {
        file = mod;
    } else {
        if (mod.strategy === 'none')
            return Promise.resolve()
        if (!force && cache.last_check && (new Date(cache.last_check).getTime() + cfg.check_interval) > new Date().getTime()) {
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
            if (!force && new Date(f.fileDate) <= new Date(cache.date))
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
        all_files = all_files.sort((i, j) => (new Date(i.fileDate).getTime() > new Date(j.fileDate).getTime() ? -1 : 1))
        file = all_files[0]
        mod.new_version = file.displayName
    }
    file.fileName = file.fileName||`${file.name}.jar`
    logger.info(`Downloading ${file.fileName}...`)
    const options = helpers.options(cfg)
    let files = fs.readdirSync(mods);
    for (let i of files) {
        let file_name = path.join(mods, i);
        if (fs.statSync(file_name).isFile()) {
            if (md5File.sync(file_name) === mod.md5) {
                fs.unlinkSync(file_name);
                logger.info(`delete old file ${i}`);
            }
        }
    }
    const dl = new DownloaderHelper(file.downloadUrl, mods, {
        httpRequestOptions: options,
        httpsRequestOptions: options,
        fileName: file.fileName,
        override: true,
        retry: cfg.retry
    });
    let new_version = file.displayName||file.name

    if (new_version.endsWith('.jar'))
        new_version = new_version.substring(0, new_version.length - 4)
    return new Promise((resolve, reject) => {
        dl.on('end', () => {
            logger.success(`Download ${file.fileName} successfully!`);
            cache.date = file.fileDate
            mod.new_version = new_version
            cache.last_check = new Date()
            mod.md5 = md5File.sync(path.join(mods, file.fileName))
            resolve()
        })
        dl.on('error', error => {
            logger.failure(`Failed to download ${file.fileName}`)
            logger.failure(error)
        })
        dl.on('timeout', () => {
            logger.failure(`Download ${file.fileName} time out`)
        })
        dl.on('retry', () => {
            logger.info(`Retry ${file.fileName}...`)
        })
        dl.start();
    });
}
