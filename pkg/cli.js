#! /usr/bin/env node
import api from './api.js'

export default function (inputFolder, destFolder) {
  try {
    api(inputFolder, destFolder, true)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
