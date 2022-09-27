#! /usr/bin/env node
import { readFileSync, statSync, unlinkSync, appendFileSync } from 'sander'
import glob from 'glob'
import { parse } from 'node-html-parser'
import { resolve } from 'path'

let files

export default start
export async function start (inputFolder, finish) {
  inputFolder = resolve(inputFolder)
  if (!statSync(inputFolder).isDirectory()) throw new Error('input is not a folder')

  files = await glob.sync(inputFolder + '/**/*.htm?(l)', { nodir: true })

  await script2import()
  await clearOtherFiles(inputFolder)
  if (finish) await done()
}

async function clearOtherFiles (inputFolder) {
  const list = await glob.sync(inputFolder + '/**/*', {
    nodir: true,
    ignore: [
      inputFolder + '/**/*.htm?(l)',
      inputFolder + '/**/*.js'
    ]
  })

  if (list) list.forEach(async file => await unlinkSync(file))
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
