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

      const content = cb(el) + '\n'
      await appendFileSync(file + '.js', content, { encoding: 'utf8' })
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

export async function done () {
  for (const file of files) {
    await unlinkSync(file)
  }
}
