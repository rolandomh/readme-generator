const fs = require('fs')
var glob = require('glob')
const child_proccess = require('child_process')

const ORIGINAL_README_NAME = 'README_RAW.md'

let ORIGINAL_README
let CURRENT_ROOT_README

let MARKDOWN_FILES

let FILE_STORAGE = []

exports.generateDocs = args => {
  commitBefore()
  getOriginalReadme()
  objectifyFiles()
  buildRootREADME()
  commitAfter()
}

function getOriginalReadme() {
  if (!fs.existsSync(ORIGINAL_README_NAME)) throw new Error(`This doesn't seem like a valid MDT project. (Missing ${ORIGINAL_README_NAME})`)

  ORIGINAL_README = { name: ORIGINAL_README_NAME, content: fs.readFileSync(ORIGINAL_README_NAME) }
}

function everyMarkdownFile() {
  let files = glob.sync('**/*.md')

  for (let i = files.length - 1; i >= 0; i--) {
    if (files[i].startsWith('node_modules')) {
      //Remove all markdown files in 'node_modules'
      files.splice(i, 1)
    } else if (!files[i].includes('/')) {
      //Remove all markdown files which are not in a subdirectory
      files.splice(i, 1)
    }
  }

  return files
}

function objectifyFiles() {
  everyMarkdownFile().forEach(path => {
    const FILE_CONTENT = fs.readFileSync(path).toString()

    let arr = path.split('/')

    let filename = arr[arr.length - 1]

    let directory = ''

    for (let i = 0; i < arr.length - 1; i++) {
      const element = arr[i]
      directory += element + '/'
    }

    let obj = { dir: directory, name: filename, content: FILE_CONTENT }
    FILE_STORAGE.push(obj)
  })
}

function writeToRootREADME(content) {
  fs.writeFileSync('README.md', content)
}

function buildRootREADME() {

  let builder = ''

  builder += ORIGINAL_README.content
  builder += '\n\n'
  builder += '----\n'
  builder += '----\n'
  builder += '----\n'
  builder += '\n\n'

  FILE_STORAGE.forEach(file => {
    builder += `# [${file.dir}${file.name}](${file.dir}${file.name})`
    builder += '\n\n'
    builder += file.content
    builder += '\n\n'
  })

  writeToRootREADME(builder)

}

function commitAfter() {
  child_proccess.execSync("git add README.md")
  child_proccess.execSync('git commit -m "Docs: Regenerate README :tada:"')
}

function commitBefore() {
  child_proccess.execSync("git add *")
  child_proccess.execSync('git commit -m "New snippets :fire:"')
}