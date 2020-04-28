const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const cpy = require('cpy');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
var adm_zip = require('adm-zip');
const logger = require('./logger');

exports.default = async (includes) => {
    if (!includes) includes = 'default'
    includes += '.json'
    const root = process.cwd();
    const modpack_temp = path.join(root,".modpack","temp");
    const overrides = path.join(root,".modpack","temp","overrides");
    logger.info(`pack a modpack in ${root}`);
    let mods_cfg;
    let cfg ;
    let includes_cfg ;
    try {
        mods_cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-mods.json")));
        includes_cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack_includes", includes)));
        cfg = JSON.parse(fs.readFileSync(path.join(root,"modpack-project.json")));
        await makeDir(modpack_temp);
    }
    catch (e) {
        logger.failure(e);
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
        logger.failure("Unsupported modloader found!")
        version = "0.0.0";
    }
    let manifest = {
        minecraft: {
            version: cfg.mcversion,
            modLoaders: {
                id: `${cfg.modloader}-${version}`,
                primary: true
            }
        },
        manifestType: "minecraftModpack",
        manifestVersion: 1,
        name: cfg.name,
        version: `${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}`,
        author: cfg.author,
        overrides: "overrides"
    }
    if (!includes_cfg.files.includes('mods')) {
        manifest.files = mods_cfg.map(i=>{return {projectID:i.addon_id,fileID:i.file_id,required:true}})
    }
    fs.writeFileSync(`${modpack_temp}/manifest.json`,JSON.stringify(manifest, '\n', 2));
    await cpy(includes_cfg.files, overrides, { parents:true });
    let zip = new adm_zip();

    zip.addLocalFolder(modpack_temp);

    zip.writeZip(path.join(root, 'build', `${cfg.name}-${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}.zip`));

    logger.success('Done!')

}
