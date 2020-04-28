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
        .action(async (cmd) => {
            await tasks.init();
        })
    commander
        .command('add <name>')
        .action(async (name, cmd) => {
            await tasks.add(name);
        })
    commander
        .command('update')
        .action(async (cmd) => {
            await tasks.update();
        })
    commander
        .command('build [includes]')
        .action(async (includes, cmd) => {
            await tasks.build(includes);
        })
    commander
        .command('publish [includes]')
        .action(async (includes, cmd) => {
            await tasks.publish(includes);
        })
    commander.parse(process.argv);
})()
