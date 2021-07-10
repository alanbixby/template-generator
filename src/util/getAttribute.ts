interface YargsObject {
  [key: string]: string
}

module.exports = (searchKeys: string | Array<string>, object: YargsObject, caseSensitive: boolean = false): string => {
  if (typeof searchKeys === 'string') {
    searchKeys = [searchKeys]
  }
  for (const searchKey of searchKeys) {
    const match = Object.keys(object).find((key) => {
      return searchKey.toLowerCase() === key.toLowerCase()
    })
    if (match) {
      return object[searchKey]
    }
  }
  return ''
}
