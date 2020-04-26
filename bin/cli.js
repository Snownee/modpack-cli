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
        .action(async (dir, cmd) => {
            await tasks.init();
        })
    commander
        .command('install')
        .option('-y, --recursive', 'Remove recursively')
        .action((dir, cmd) => {
            console.log('remove ' + dir + (cmd.recursive ? ' recursively' : ''))
        })
    commander.parse(process.argv);
})()
