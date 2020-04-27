const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const cpy = require('cpy');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
var adm_zip = require('adm-zip');

exports.default = async () => {
    const root = process.cwd();
    const crane_temp = path.join(root,".crane","temp");
    const overrides = path.join(root,".crane","temp","overrides");
    console.log(chalk.blue(`[Crane]: pack a modpack in ${root}`));
    let mods_cfg;
    let cfg ;
    let includes_cfg ;
    try {
        mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-mods.json")));
        includes_cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-includes.json")));
        cfg = JSON.parse(fs.readFileSync(path.join(root,"crane-project.json")));
        await makeDir(crane_temp);
    }
    catch (e) {
        console.log(chalk.red(e));
        process.exit();
    }
    let version;
    if (cfg.modloader === "forge"){
        let versions = (await (await fetch(`https://bmclapi2.bangbang93.com/forge/minecraft/${cfg.mcversion}`)).json())
        versions = versions.sort((i,j)=>(new Date(i.modified).getTime() > new Date(j.modified).getTime()?-1:1))
        let ans = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'modloder_version',
                    message: chalk.red('Which modloader version do you like?'),
                    default: 0,
                    choices:versions.map(i=>`${i.version} at ${i.modified}`)
                }
            ]
        )
        version = ans.modloder_version.split(' at ')[0];
    }
    else {
        console.log(chalk.red("do not support modloder version find!"))
        version = "0.0.0";
    }
    let manifest = {
        minecraft:{
            version:cfg.mcversion,
            modLoaders:{
                id:`${cfg.modloader}-${version}`,
                primary:true
            }
        },
        manifestType: "minecraftModpack",
        manifestVersion: 1,
        name: cfg.name,
        version: `${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}`,
        author: cfg.author,
        files:mods_cfg.map(i=>{return {projectID:i.addon_id,fileID:i.file_id,required:true}}),
        overrides:"overrides"
    }
    fs.writeFileSync(`${crane_temp}/manifest.json`,JSON.stringify(manifest, '\n', 2));
    await cpy(includes_cfg, overrides,{parents:true});
    let zip = new adm_zip();

    zip.addLocalFolder(crane_temp);

    zip.writeZip(`${root}/${cfg.name}-${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}.zip`);


}
