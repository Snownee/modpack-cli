const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, inlineLog, options } = require('./helpers');
const logger = require('./logger');

exports.default = async (name) => {
    const root = process.cwd();
    logger.info(`Add mod ${name} in ${root}`);
    const mods = path.join(root,"mods");
    let mods_cfg;
    let cfg ;
    try {
        mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-mods.json")));
    } catch (e) {
        mods_cfg = []
    }
    try {
        cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-project.json")));
        makeDir.sync(mods);
    }
    catch (e) {
        logger.failure(e);
        process.exit();
    }
    let mod;
    logger.info('Fetching...');
    if (/^\d+$/.test(name)){
        let mod =await (await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/${name}`, options(cfg))).json()
    }
    else {
        mods_list = await (await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/search?sectionId=6&gameId=432&searchFilter=${name.replace(' ','+')}&gameVersion=${cfg.mcversion}`, options(cfg))).json()
        if (mods_list.length === 0){
            logger.failure(`Cannot find any mod!`);
            process.exit();
        }
        let que = [];
        for (let i of mods_list) {
            if (cfg.modloader === 'forge' && i.name.toLowerCase().includes('fabric') && !name.toLowerCase().includes('fabric')) continue
            if (cfg.modloader === 'fabric' && i.name.toLowerCase().includes('forge') && !name.toLowerCase().includes('forge')) continue
            que.push(`${chalk.yellowBright(i.name)} by ${i.authors[0].name}`)
        }
        logger.info(`Found ${que.length} result(s)`)
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
    if (mods_cfg.filter(i=>i.addon_id===mod.id).length > 0){
        logger.failure(`Already exist this mod!`);
        process.exit();
    }
    let ans = await inquirer.prompt([
        {
            type: 'list',
            name: 'strategy',
            message: chalk.red('Choose updating strategy:'),
            choices: [ "beta", "release", "alpha", "none" ]
        }
    ])
    logger.success(`Mod ${mod.name} added!`);
    mods_cfg.push({
        addon_id: mod.id,
        slug: mod.slug,
        name: mod.name,
        strategy: ans.strategy
    });
    fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
    /*
    let mod_all_files = (await (await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/${mod.id}/files`)).json())
    mod_all_files = mod_all_files.sort((i,j)=>(new Date(i.fileDate).getTime() > new Date(j.fileDate).getTime()?-1:1))
    let mod_file = [];
    let mod_file_infos = [];
    for (let i of mod_all_files){
        let is_ok = i.gameVersion.filter((j)=>j===cfg.mcversion);
        if (is_ok.length > 0){
            mod_file.push(i);
            mod_file_infos.push(`${chalk.blueBright(i.displayName)} ${chalk.black("at")} ${i.fileDate}`)
        }
    }
    let ans = await inquirer.prompt([
        {
            type: 'list',
            name: 'mod',
            message: chalk.red('Which mod version do your want?'),
            default: 0,
            choices:mod_file_infos
        }
    ])
    let index = mod_file_infos.findIndex((i)=>i===ans.mod);
    let file = mod_file[index];
    let startTime = new Date();
    const dl = new DownloaderHelper(file.downloadUrl, mods,{override:true});
    dl.on('end', () => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        logger.success(`Mod ${mod.name} installed!`);
        mods_cfg.push({
            addon_id: mod.id,
            slug: mod.slug,
            file_id: file.id,
            name: mod.name,
            file_name: file.displayName,
            dl_url: file.downloadUrl,
            dependencies: file.dependencies
        });
        fs.writeFileSync(path.join(root, 'modpack-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
    })
    dl.on('progress', stats => {
        const progress = stats.progress.toFixed(1);
        const speed = byteHelper(stats.speed);
        const downloaded = byteHelper(stats.downloaded);
        const total = byteHelper(stats.total);

        // print every one second
        const currentTime = new Date();
        const elaspsedTime = currentTime - startTime;
        if (elaspsedTime > 1000) {
            startTime = currentTime;
            inlineLog(`${speed}/s - ${progress}% [${downloaded}/${total}]`);
        }
    })
    await dl.start();
    */
}
