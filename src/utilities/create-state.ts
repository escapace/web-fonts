import { findUp } from 'find-up'
import { includes, isString } from 'lodash-es'
import path from 'path'
import {
  DEFAULT_JSON_FILE,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_PUBLIC_PATH
} from '../constants'
import { Options, State } from '../types'
import { configuration } from './configuration'
import { Console } from './console'

export const createState = async (options: Options): Promise<State> => {
  const console = new Console(options)
  const declaration = options.declaration === true
  const cwd = options.cwd ?? process.cwd()
  const outputDir = path.resolve(cwd, options.outputDir ?? DEFAULT_OUTPUT_DIR)
  const publicPath = options.publicPath ?? DEFAULT_PUBLIC_PATH
  const jsonFile = path.resolve(cwd, options.jsonFile ?? DEFAULT_JSON_FILE)
  const cacheFonts: State['cacheFonts'] = new Map()
  const loaderFile =
    options.loaderFile === undefined
      ? undefined
      : path.resolve(cwd, options.loaderFile)

  if (isString(loaderFile)) {
    const extension = path.extname(loaderFile)

    if (!includes(['.js', '.mjs'], extension)) {
      return console.exit(
        '--loader-file option supports .js, and .mjs extensions'
      )
    }

    if (extension === '.mjs' && declaration) {
      console.warn(`.mjs imports in typescript are not supported`)
    }
  }

  if (loaderFile === undefined && declaration) {
    console.exit('--declaration flag requires --loader-file option')
  }

  if (options.cli === true) {
    console.spinner.start()
  }

  console.spinner.text = 'starting up'

  const packageJSON = await findUp('package.json', { cwd: __dirname })

  if (packageJSON === undefined) {
    return console.exit('Damaged installation')
  }

  const absWorkingDir = path.dirname(packageJSON)

  const sourceWebFontLoader = path.join(
    absWorkingDir,
    'src/utilities/font-loader.ts'
  )

  const scriptFontStrip = path.join(
    absWorkingDir,
    'src/utilities/font-strip.py'
  )

  const { locales, configFile } = await configuration(cwd, console)

  console.spinner.text = `read ${configFile}`

  return {
    absWorkingDir,
    cacheFonts,
    console,
    cwd,
    declaration,
    jsonFile,
    loaderFile,
    locales,
    outputDir,
    publicPath,
    scriptFontStrip,
    sourceWebFontLoader
  }
}
