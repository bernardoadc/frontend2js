#! /usr/bin/env node
import api from './pkg/api.js'
import cli from './pkg/cli.js'

if (process.argv[2]) cli(process.argv[2], process.argv[3])

export default api
