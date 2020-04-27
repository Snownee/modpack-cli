const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
const { DownloaderHelper } = require('node-downloader-helper');

exports.default = async (name) => {
    const root = process.cwd();
    console.log(chalk.blue(`[Crane]: add mod ${name} in ${root}`));
    const mods = path.join(root,"mods");
    let mods_cfg;
    let cfg ;
    try {
        mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-mods.json")));
        cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-project.json")));
        await makeDir(mods);

    }
    catch (e) {
        console.log(chalk.red(e));
        process.exit();
    }
    let mod;
    if (/\d+/.test(name)){
        let mod =await (await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/${name}`)).json()
        console.log(mod)
    }
    else {
        mods_list = await (await fetch(`https://addons-ecs.forgesvc.net/api/v2/addon/search?sectionId=6&gameId=432&gameVersion=${cfg.mcversion}&searchFilter=${name}`)).json()
        if (mods_list.length === 0){
            console.log(chalk.red(`[Crane]: do not found any mod!`));
            process.exit();
        }
        let que = [];
        for (let i of mods_list) {
            que.push(`${chalk.blueBright(i.name)} ${chalk.black("by")} ${i.authors[0].name}`)
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
    if (mods_cfg.filter(i=>i.addon_id===mod.id).length > 0){
        console.log(chalk.red(`[Crane]: already exist this mod!`));
        process.exit();
    }
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
    const dl = new DownloaderHelper(file.downloadUrl, mods,{override:true});
    dl.on('end', () => {
        console.log(chalk.green(`[Crane]: mod ${mod.name} install succeed!`));
        mods_cfg.push({addon_id:mod.id,file_id:file.id,name:mod.name,
            file_name:file.displayName,dl_url:file.downloadUrl,dependencies:file.dependencies});
        fs.writeFileSync(path.join(root, 'crane-mods.json'), JSON.stringify(mods_cfg, '\n', 2))
    })
    await dl.start();
}
