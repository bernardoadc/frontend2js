#! /usr/bin/env node
import { readFile, statSync, unlink, appendFile } from 'fs'
import glob from 'glob'
import { parse } from 'node-html-parser'
import { resolve } from 'path'

let files

function clearOtherFiles (inputFolder) {
  glob(inputFolder + '/**/*', {
    nodir: true,
    ignore: [
      inputFolder + '/**/*.htm?(l)',
      inputFolder + '/**/*.js'
    ]
  }, (err, files) => !err && files && files.forEach(async file => unlink(file, () => {})))
}

function process (selector, cb) {
  for (const file of files) {
    readFile(file, function (err, data) {
      if (err) throw err

      const root = parse(data)
      const scope = root.querySelectorAll(selector)
      if (!scope) return

      const content = cb(scope)

      appendFile(file + '.js', content, { encoding: 'utf8' }, () => {})
    })
  }
}

function script2import () {
  process('script', function (scripts) {
    let content = ''

    for (const script of scripts) {
      const src = script.rawAttrs.replace('src=', '').replaceAll('"', '') // script.getAttribute('src')
      content += `import '${src}'\n`
    }

    return content
  })
}

function done () {
  for (const file of files) {
    unlink(file, () => {})
  }
}

export default function frontend2js (inputFolder, finish) {
  inputFolder = resolve(inputFolder)

  if (!statSync(inputFolder).isDirectory()) throw new Error('input is not a folder')

  glob(inputFolder + '/**/*.htm?(l)', { nodir: true }, function (err, list) {
    if (err) throw err
    files = list

    script2import()
    clearOtherFiles(inputFolder)
    if (finish) done()
  })
}
