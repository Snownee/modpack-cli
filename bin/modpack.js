#!/usr/bin/env node

const commander = require('commander');
const tasks = require("../src/mod");
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

//https://github.com/tj/commander.js#action-handler-subcommands
(async () => {
    let version = "undefined";
    try{
        version = JSON.parse(fs.readFileSync(path.join(__dirname,"..","package.json"))).version;
    }catch (e) {
    }
    commander
        .version(`modpack version ${version}`)
        .description('Minecraft modpack management CLI');

    commander
        .command('init')
        .description('Init a new modpack environment in this folder!')
        .action(async (cmd) => {
            await tasks.init();
        })
    commander
        .command('add <name>')
        .description('Add new mod to modpack!')
        .action(async (name, cmd) => {
            await tasks.add(name);
        })
    commander
        .command('update [mod_name]')
        .description('Update added mods!')
        .action(async (mod_name, cmd) => {
            await tasks.update(mod_name);
        })
    commander
        .command('remove [mod_name]')
        .description('Remove mod!')
        .action(async (mod_name, cmd) => {
            await tasks.remove(mod_name);
        })
    commander
        .command('list')
        .description('list all mods!')
        .action(async (cmd) => {
            await tasks.list();
        })
    commander
        .command('build [includes]')
        .description('build this modpack!')
        .action(async (includes, cmd) => {
            await tasks.build(includes);
        })
    commander
        .command('publish [includes]')
        .description('publish this modpack!')
        .action(async (includes, cmd) => {
            await tasks.publish(includes);
        })
    commander.parse(process.argv);
})()
