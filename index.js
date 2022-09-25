#! /usr/bin/env node
import { readFile, statSync, unlink, writeFile } from 'fs'
import glob from 'glob'
import { parse } from 'node-html-parser'
import { resolve } from 'path'

const inputFolder = resolve(process.argv[2])

if (!statSync(inputFolder).isDirectory()) {
  console.error('input is not a folder')
  process.exit(1)
}

glob(inputFolder + '/**/*', {
  nodir: true,
  ignore: [
    inputFolder + '/**/*.htm?(l)',
    inputFolder + '/**/*.js'
  ]
}, (err, files) => !err && files && files.forEach(async file => unlink(file, () => {})))

glob(inputFolder + '/**/*.htm?(l)', { nodir: true }, function (err, files) {
  if (err) return
  for (const file of files) {
    let content = ''
    readFile(file, function (err, data) {
      if (err) throw err

      const root = parse(data)
      const scripts = root.querySelectorAll('script')
      if (!scripts) return

      for (const script of scripts) {
        const src = script.rawAttrs.replace('src=', '').replaceAll('"', '') // script.getAttribute('src')
        content += `import '${src}'\n`
      }

      writeFile(file + '.js', content, { encoding: 'utf8' }, () => {})
      unlink(file, () => {})
    })
  }
})
