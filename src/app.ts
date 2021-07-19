#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const enquirer = require('enquirer')
const ejs = require('ejs')
const chalk = require('chalk')
const shell = require('shelljs')
const yargs = require('yargs') // TODO: Utilize yargs.usage and .option to alias flags and remove getAttribute.ts
const ora = require('ora')
const { argv } = yargs

const { validatePackageName, cleanPackageName } = require('./util/processPackageName')
const getAttribute = require('./util/getAttribute')
const postExecution = require('./util/postExecution')

const IGNORE_FILES = ['node_modules']

const projectTemplates = fs.readdirSync(path.join(__dirname, 'templates'))
const enquirerPrompts = [
  {
    name: 'projectName',
    type: 'input',
    message: 'Project name:',
    skip: () => {
      let name = getAttribute(['name', 'projectName'], argv)
      if (!name) {
        return false
      }
      const validation = validatePackageName(name, false)
      if (validation === true) {
        // explicit since validateNPMPackageName returns string on error which is truthy
        return true
      }
      console.log(chalk.yellow(`! '${name}' failed validation: ${name}`))
      return !!validation
    },
    onSubmit: (name: string, value: string, prompt: any) => {
      if (prompt.skipped) {
        console.log(chalk.magenta('>'), 'Using project name:', chalk.blue(getAttribute(['name', 'templateName'], argv)))
      }
    },
    validate: (name: string) => {
      name = name || getAttribute(['name', 'projectName'], argv)
      return validatePackageName(name)
    },
    format: cleanPackageName,
    result: (name: string) => {
      name = name || getAttribute(['name', 'projectName'], argv)
      return cleanPackageName(name)
    },
  },
  {
    name: 'templateName',
    type: 'select',
    message: 'What template would you like to generate?',
    choices: projectTemplates,
    initial: projectTemplates[0],
    skip: !!getAttribute(['y', 'default', 'skip'], argv) || projectTemplates.length === 1,
    onSubmit: (name: string, value: string, prompt: any) => {
      if (prompt.skipped && prompt.initial) {
        console.log(chalk.magenta('>'), 'Using the template:', chalk.blue(prompt.initial))
      }
    },
  },
  {
    name: 'installDeps',
    type: 'confirm',
    message: 'Automatically install dependencies:',
    initial: true,
    skip: !!getAttribute(['y', 'default', 'skip'], argv),
    onSubmit: (name: string, value: string, prompt: any) => {
      if (prompt.skipped && prompt.initial) {
        console.log(chalk.magenta('>'), 'Automatically installing dependencies...')
      }
    },
  },
  {
    name: 'gitInit',
    type: 'confirm',
    message: 'Initialize git repository:',
    initial: true,
    skip: !!getAttribute(['y', 'default', 'skip'], argv),
    onSubmit: (name: string, value: string, prompt: any) => {
      if (prompt.skipped && prompt.initial) {
        console.log(chalk.magenta('>'), 'Initializing git...')
      }
    },
  },
]

const CURRENT_DIR = process.cwd()

export interface TemplateData {
  projectName: string
}

function populateTemplateData(sourceContent: string, projectData: TemplateData) {
  return ejs.render(sourceContent, projectData)
}

async function buildProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    if (getAttribute(['f', 'force', 'o', 'overwrite'], argv)) {
      const { confirmOverwrite } = await enquirer.prompt({
        name: 'confirmOverwrite',
        type: 'confirm',
        message: chalk.yellow('This directory already exists, are you sure you want to overwrite it?'),
        initial: !!getAttribute(['f', 'force'], argv),
        skip: !!getAttribute(['f', 'force'], argv),
        onSubmit: (name: string, value: string, prompt: any) => {
          if (prompt.skipped && prompt.initial) {
            console.log(chalk.magenta('>'), 'Automatically overwriting the target directory.')
          }
        },
      })
      if (!confirmOverwrite) {
        console.error(chalk.red('\n❌ | Operation cancelled by user, target directory already exists.'))
        return false
      }
      fs.rmdirSync(projectPath, { recursive: true })
      fs.mkdirSync(projectPath)
      return true
    } else {
      console.error(chalk.red(`\n❌ | The target directory already exists; use -o to overwrite this directory.`)) // TODO: Refactor to be in onSubmit() so the CLI fails faster
      return false
    }
  }
  fs.mkdirSync(projectPath)
  return true
}

function buildDirectory(templatePath: string, projectName: string) {
  const templateFiles = fs.readdirSync(templatePath)

  for (const file of templateFiles) {
    if (IGNORE_FILES.includes(file)) {
      continue
    }
    const filePath = path.join(templatePath, file)
    const fileInfo = fs.statSync(filePath)
    const targetPath = path.join(CURRENT_DIR, projectName, file)
    if (fileInfo.isFile()) {
      let fileContent = fs.readFileSync(filePath, 'utf8')
      fileContent = populateTemplateData(fileContent, { projectName })
      fs.writeFileSync(targetPath, fileContent, 'utf8')
    } else if (fileInfo.isDirectory()) {
      fs.mkdirSync(targetPath)
      buildDirectory(path.join(templatePath, file), path.join(projectName, file))
    }
  }
}

interface CLIOptions {
  gitInit: boolean
  installDeps: boolean
  projectName: string
}

function postProcess(options: CLIOptions) {
  shell.cd(path.join(CURRENT_DIR, options.projectName))
  if (options.gitInit) {
    if (!shell.which('git')) {
      console.log(chalk.red('❌ | Git is not installed, skipping git initialization.'))
    } else {
      shell.exec('git init', { silent: false })
    }
  }
  if (options.installDeps) {
    if (!shell.which('npm')) {
      console.log(chalk.red('❌ | NPM is not installed, skipping npm dependencies installation.'))
    } else {
      const spinner = ora('Installing NPM dependencies..').start()
      spinner.color = 'blue'
      try {
        shell.exec('npm install -y', { silent: false })
        spinner.succeed('All NPM dependencies installed.')
      } catch (err) {
        spinner.fail(err)
      }
    }
  }
}

;(async () => {
  try {
    const answers = { ...(await enquirer.prompt(enquirerPrompts)), ...argv }
    if (!!getAttribute(['d', 'dry-run', 'dryrun'], argv)) {
      console.log(chalk.blue('o'), 'Dry-run complete; stopping template generator.')
      process.exit()
    }
    const { templateName, projectName } = answers
    const templatePath = path.join(__dirname, 'templates', templateName)
    const projectPath = path.join(CURRENT_DIR, projectName)
    if (!(await buildProject(projectPath))) {
      return
    }
    buildDirectory(templatePath, projectName)
    postProcess(answers)
    postExecution(projectName)
  } catch (err) {
    if (!err) {
      console.error(chalk.red('❌ | Operation cancelled by user.'))
    } else {
      console.error(chalk.bold.yellow(`⚠ | ${err}`))
    }
  }
})()
