#!/usr/bin/env node

const commander = require('commander');
const tasks = require("../src/mod");
const chalk = require('chalk');
//https://github.com/tj/commander.js#action-handler-subcommands
(async () => {
    commander
        .version('0.0.1')
        .description('do for minecraft modpack!');

    commander
        .command('init')
        .action(async ( cmd) => {
            await tasks.init();
        })
    commander
        .command('add <name>')
        .option('-d, --id', 'use mod curseforge id')
        .action(async (name, cmd) => {
            await tasks.add(name,cmd.id);
        })
    commander.parse(process.argv);
})()
