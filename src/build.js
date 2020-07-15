const chalk = require('chalk');
const path = require('path');
const makeDir = require('make-dir');
const fs = require('fs');
const cpy = require('cpy');
const inquirer = require('inquirer')
const fetch = require('node-fetch');
const adm_zip = require('adm-zip');
const logger = require('./logger');
const rimraf = require('rimraf')
const md5File = require('md5-file')

exports.default = async (includes) => {
    if (!includes) includes = 'default'
    includes += '.json'
    const root = process.cwd();
    const modpack_temp = path.join(root, ".modpack", "temp");
    await rimraf(modpack_temp, async () => {
        const overrides = path.join(root, ".modpack", "temp", "overrides");
        logger.info(`pack a modpack in ${root}`);
        let mods_cfg;
        let cfg;
        let includes_cfg;
        try {
            mods_cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack-mods.json")));
            includes_cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack_includes", includes)));
            cfg = JSON.parse(fs.readFileSync(path.join(root, "modpack-project.json")));
            await makeDir(modpack_temp);
        } catch (e) {
            logger.failure(e);
            process.exit();
        }
        let version;
        if (cfg.modloader === "forge") {
            let versions = (await (await fetch(`https://bmclapi2.bangbang93.com/forge/minecraft/${cfg.mcversion}`)).json())
            versions = versions.sort((i, j) => (new Date(i.modified).getTime() > new Date(j.modified).getTime() ? -1 : 1))
            let ans = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'modloder_version',
                        message: chalk.red('Which modloader version do you like?'),
                        default: 0,
                        choices: versions.map(i => `${i.version} at ${i.modified}`)
                    }
                ]
            )
            version = ans.modloder_version.split(' at ')[0];
        } else {
            logger.failure("Unsupported modloader found!")
            version = "0.0.0";
        }
        let manifest = {
            minecraft: {
                version: cfg.mcversion,
                modLoaders: [{
                    id: `${cfg.modloader}-${version}`,
                    primary: true
                }]
            },
            manifestType: "minecraftModpack",
            manifestVersion: 1,
            name: cfg.name,
            version: `${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}`,
            author: cfg.author,
            overrides: "overrides"
        }
        if (!includes_cfg.files.includes('mods')) {
            includes_cfg.files.push('mods')
            includes_cfg.files = includes_cfg.files.filter(i => fs.existsSync(i));
            manifest.files = mods_cfg.map(i => i.downloadUrl ? undefined : {
                projectID: i.addon_id,
                fileID: i.file_id,
                required: true,
                md5: i.md5
            }).filter(i => i)
            logger.info(`Add ${manifest.files.length} mods to manifest!`)
            if (includes_cfg.files.length > 0) {
                await cpy(includes_cfg.files, overrides, {
                    parents: true, filter: file => {
                        const md5 = md5File.sync(file.path);
                        return manifest.files.filter(i => md5 === i.md5).length <= 0;
                    }
                });
            }
        } else {
            await cpy(includes_cfg.files, overrides, {parents: true});
        }
        fs.writeFileSync(`${modpack_temp}/manifest.json`, JSON.stringify(manifest, '\n', 2));
        let zip = new adm_zip();

        zip.addLocalFolder(modpack_temp);

        zip.writeZip(path.join(root, 'build', `${cfg.name}-${cfg.version.major}.${cfg.version.minor}.${cfg.version.patch}.zip`));

        logger.success('Done!')

    });

}
