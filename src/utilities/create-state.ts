import { findUp } from 'find-up'
import path from 'path'
import { Options, State } from '../types'
import { configuration } from './configuration'
import { Console } from './console'

export const createState = async (options: Options): Promise<State> => {
  const _console = new Console(options)
  const cwd = options.cwd ?? process.cwd()
  const fontsDir = path.resolve(cwd, options.fontsDir ?? 'public/assets/fonts')
  const publicDir = options.publicDir ?? '/assets/fonts'
  const fontLoaderPath = path.resolve(
    cwd,
    options.fontLoaderPath ?? 'src/font-loader.js'
  )
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
    fontLoaderPath,
    fontsDir,
    locales,
    publicDir,
    scriptFontStrip,
    sourceServerFontLoader,
    sourceWebFontLoader
  }
}
