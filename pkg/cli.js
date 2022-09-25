#! /usr/bin/env node
import api from './api.js'

export default function (inputFolder) {
  try {
    api(inputFolder, true)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
