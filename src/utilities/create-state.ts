import { findUp } from 'find-up'
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
  const _console = new Console(options)
  const cwd = options.cwd ?? process.cwd()
  const outputDir = path.resolve(cwd, options.outputDir ?? DEFAULT_OUTPUT_DIR)
  const publicPath = options.publicPath ?? DEFAULT_PUBLIC_PATH
  const jsonFile = path.resolve(cwd, options.jsonFile ?? DEFAULT_JSON_FILE)
  const cacheFonts: State['cacheFonts'] = new Map()

  const packageJSON = await findUp('package.json', { cwd: __dirname })

  if (packageJSON === undefined) {
    return _console.exit('Damaged installation')
  }

  const absWorkingDir = path.dirname(packageJSON)

  const sourceWebFontLoader = path.join(
    absWorkingDir,
    'src/font-loader/browser.ts'
  )
  const sourceServerFontLoader = path.join(
    absWorkingDir,
    'src/font-loader/server.ts'
  )

  const scriptFontStrip = path.join(
    absWorkingDir,
    'src/utilities/font-strip.py'
  )

  const { locales, configFile } = await configuration(cwd, _console)

  _console.spinner.text = `read ${configFile}`

  return {
    absWorkingDir,
    cacheFonts,
    console: _console,
    cwd,
    jsonFile,
    outputDir,
    locales,
    publicPath,
    scriptFontStrip,
    sourceServerFontLoader,
    sourceWebFontLoader
  }
}
