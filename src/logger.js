const chalk = require('chalk');

module.exports = {
    failure: s => console.log(chalk.red(`[Crane]: ${s}`)),

    success: s => console.log(chalk.green(`[Crane]: ${s}`)),

    info: s => console.log(`[Crane]: ${s}`)
}
