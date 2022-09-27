import test from 'ava'
import { rimrafSync, copydirSync, existsSync, readFileSync } from 'sander'
import { exec } from 'child_process'

import { default as f2js, start, process, done } from '../pkg/api.js'

const fakeProj = './tests/fake-proj'
const fakeProjTest = fakeProj + '-test'

test.serial('cli', async function (t) {
  await new Promise(function (resolve, reject) {
    exec(`npm start "${fakeProj}" "${fakeProjTest}"`, function (error, stdout, stderr) {
      if (error) t.fail(error.message)
      if (stderr) t.fail(stderr)
      if (stdout) resolve(stdout)
    })
  })

  t.truthy(await existsSync(fakeProjTest + '/index.html.js'))
})

test.serial('dont copy non-js files', async function (t) {
  t.falsy(await existsSync(fakeProjTest + '/index.html'))
  t.falsy(await existsSync(fakeProjTest + '/index.css'))
})

test.serial('imports', async function (t) {
  await f2js(fakeProj, fakeProjTest, true)

  const output = await readFileSync(fakeProjTest + '/index.html.js').toString()

  t.is(output, `import './index.js'\n\n      var x = 2\n    \n`)
})
