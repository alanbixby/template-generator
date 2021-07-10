const validateNPMPackageName = require('validate-npm-package-name')

const validatePackageName = (name: string, cleanInput: boolean = true) => {
  name = cleanInput ? cleanPackageName(name) : name
  const { validForNewPackages, warnings = [], errors = [] } = validateNPMPackageName(name)
  const output = [...warnings, ...errors]
  if (name?.length < 3) {
    output.push('avoid short package names; use at least 3 characters')
  }
  if (validForNewPackages && output.length === 0) {
    return true
  }
  return output.join('\n> ')
}

const cleanPackageName = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9\-\._]/g, '')
}

module.exports = {
  validatePackageName,
  cleanPackageName,
}
