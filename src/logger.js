const chalk = require('chalk');

module.exports = {
    failure: s => console.log(chalk.red(`[Modpack]: ${s}`)),

    success: s => console.log(chalk.green(`[Modpack]: ${s}`)),

    info: s => console.log(`[Modpack]: ${s}`)
}
