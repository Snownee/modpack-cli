const chalk = require('chalk');
var inquirer = require('inquirer')
exports.default = async () => {
    const root = process.cwd();
    console.log(chalk.blue(`[Crane]: init a modpack in ${root}`));
    //https://juejin.im/entry/5937c73cac502e0068cf1171
    let ans = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: chalk.red('What is your modpack name?'),
            default: "new modpack"
        },
        {
            type: 'input',
            name: 'version',
            message: chalk.red('Which is your minecraft version?'),
            default: "1.12.2"
        },
        {
            type: 'list',
            name: 'modloader',
            message: chalk.red('Which modloader do your like?'),
            default: 0,
            choices:["forge","fabric"]
        }
    ])
    console.log(ans)

}