#! /usr/bin/env node
import { existsSync, statSync, rimrafSync, copyFileSync, readFileSync, unlinkSync, appendFileSync } from 'sander'
import glob from 'glob'
import { parse } from 'node-html-parser'
import { resolve } from 'path'

let files

export default start
export async function start (inputFolder, destFolder, finish) {
  inputFolder = resolve(inputFolder)
  destFolder = resolve(destFolder)
  if (!existsSync(inputFolder)) throw new Error('input does not exist')
  if (!statSync(inputFolder).isDirectory()) throw new Error('input is not a folder')
  if (existsSync(destFolder) && !statSync(destFolder).isDirectory()) throw new Error('destination is not a folder')

  // copy only files with allowed extensions
  await rimrafSync(destFolder)
  const extensions = '.?(htm?(l))?(?(c|m)js?(x))' // htm, html, js, cjs, mjs, jsx
  const toCopy = await glob.sync(inputFolder + '/**/*' + extensions)
  for (const file of toCopy) {
    const dest = file.replace(inputFolder, destFolder)
    await copyFileSync(file).to(dest)
  }

  // gets definitive file list
  files = await glob.sync(destFolder + '/**/*' + '.htm?(l)', { nodir: true })

  await script2import()
  if (finish) await done()
}

export async function process (selector, cb) {
  for (const file of files) {
    const data = await readFileSync(file)
    const root = parse(data)
    const scope = root.querySelectorAll(selector)
    if (!scope) return

    for (const el of scope) {
      el.attrsObj = el.rawAttrs.split(' ').reduce((o, rattr) => { // corrects node-html-parser bug
        const [name, value] = rattr.split('=')
        o[name] = value ? value.slice(1, -1) : true
        return o
      }, {})

      const content = cb(el) + '\n'
      await appendFileSync(file + '.js', content, { encoding: 'utf8' })
    }
  }
}

async function script2import () {
  await process('script[src]', script => `import '${script.attrsObj.src}'`)
  await process('script:not([src])', script => script.textContent)
}

export async function done () {
  for (const file of files) {
    await unlinkSync(file)
  }
}
