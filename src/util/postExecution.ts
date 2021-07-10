const chalk = require('chalk')

/* prettier-ignore */
module.exports = (projectName: string) => {
  console.log()
  console.log('--------------------------------------------------------------------------')
  console.log(chalk.bold.yellow('  _         _') + chalk.bold.green('   _____                    _       _        ____            '))
  console.log(chalk.bold.yellow(' | |____  _| |_') + chalk.bold.green('|_   _|__ _ __ ___  _ __ | | __ _| |_ ___ / ___| ___ _ __  '))
  console.log(chalk.bold.yellow(" | '_ \\ \\/ / '_ \\") + chalk.bold.green("| |/ _ \\ '_ ` _ \\| '_ \\| |/ _` | __/ _ \\ |  _ / _ \\ '_ \\ "))
  console.log(chalk.bold.yellow(' | |_) >  <| |_)') + chalk.bold.green(' | |  __/ | | | | | |_) | | (_| | ||  __/ |_| |  __/ | | |'))
  console.log(chalk.bold.yellow(' |_.__/_/\\_\\_.__/') + chalk.bold.green('|_|\\___|_| |_| |_| .__/|_|\\__,_|\\__\\___|\\____|\\___|_| |_|'))
  console.log(chalk.bold.green('                                  |_|                                     '))
  console.log(`\nThe project '${chalk.bold.magenta(projectName)}' has been created; use ${chalk.blue(`cd ${projectName}`)} to enter this directory.`)
}
