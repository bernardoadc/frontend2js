#! /usr/bin/env node
import api from './pkg/api.js'
import cli from './pkg/cli.js'

if (process.argv[2]) cli(process.argv[2])

export default api
