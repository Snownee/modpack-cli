#!/usr/bin/env node

const commander = require('commander');
const tasks = require("../src/mod");
const chalk = require('chalk');
//https://github.com/tj/commander.js#action-handler-subcommands
(async () => {
    commander
        .version('0.0.1')
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
