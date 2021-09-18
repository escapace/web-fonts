#!/usr/bin/env node

import arg from 'arg'
import chalk from 'chalk'
import { isError } from 'lodash-es'
import {
  DEFAULT_LOADER_PATH,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from './constants'
import { webFonts } from './index'
import { Options } from './types'

const help = (code: 0 | 1 = 0, message?: string): never => {
  console.log(`Usage: web-fonts [options]

  Requires a ${chalk.yellow(
    'web-fonts.config.(ts|mjs|cjs|js|json)'
  )} configuration file
  in the current working directory.

  See ${chalk.blue('https://bit.ly/escapace-web-fonts')} for the documentation.

Options:
  --output-dir    font output directory path (default: ${DEFAULT_OUTPUT_DIR})
  --loader-path   font loader output file path (default: ${DEFAULT_LOADER_PATH})
  --public-path   font public prefix on the web server (default: ${DEFAULT_PUBLIC_PATH})
  -h, --help      display help

Examples:
  ${chalk.gray('# run in a container')}
  docker run --rm --mount type=bind,source="$(pwd)",target=/wd -it escapace/web-fonts
  `)

  if (message !== undefined) {
    console.error(`${chalk.bgRed('ERROR')} ${message}`)
  }

  return process.exit(code)
}

const options = (): Options => {
  try {
    const args = arg({
      '--help': Boolean,
      '--output-dir': String,
      '--loader-path': String,
      '--public-path': String,
      '-h': '--help'
    })

    if (args['--help'] === true) {
      return help()
    }

    return {
      loaderPath: args['--loader-path'],
      outputDir: args['--output-dir'],
      publicPath: args['--public-path']
    }
  } catch (e) {
    return help(1, isError(e) ? e.message : undefined)
  }
}

void webFonts({
  cli: true,
  ...options()
})
