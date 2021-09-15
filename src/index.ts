import { build } from 'esbuild'
import path from 'path'
import { TextDecoder } from 'util'
import { Options, SchemaLocales, State } from './schema'
import { configuration } from './utilities/configuration'
import { createData } from './utilities/create-data'

const createState = async (options: Options): Promise<State> => {
  const cwd = options.cwd ?? process.cwd()
  const fontsDir = path.resolve(cwd, options.fontsDir ?? 'public/assets/fonts')
  const publicDir = options.publicDir ?? '/assets/fonts'
  const fontLoaderPath = path.resolve(
    cwd,
    options.fontLoaderPath ?? 'src/font-loader.js'
  )
  const cacheFonts: Map<string, true> = new Map()
  const absWorkingDir = path.resolve(__dirname, '../../')

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

  const locales = SchemaLocales.parse(await configuration(cwd))

  return {
    absWorkingDir,
    cacheFonts,
    cwd,
    fontLoaderPath,
    scriptFontStrip,
    fontsDir,
    locales,
    publicDir,
    sourceServerFontLoader,
    sourceWebFontLoader
  }
}

export const run = async (options: Options = {}) => {
  const state = await createState(options)
  const data = await createData(state)

  const { outputFiles: webFontLoaderFiles } = await build({
    entryPoints: [state.sourceWebFontLoader],
    absWorkingDir: state.absWorkingDir,
    bundle: true,
    minify: true,
    platform: 'browser',
    write: false,
    format: 'iife',
    define: {
      __DATA_FONTS__: JSON.stringify(data.fonts),
      __DATA_LOCALE_INDEX__: JSON.stringify(data.localeIndex)
    }
  })

  const webFontLoader = webFontLoaderFiles
    .map((file) =>
      new TextDecoder('utf-8').decode(file.contents).replace(/\n$/, '')
    )
    .join('')

  await build({
    entryPoints: [state.sourceServerFontLoader],
    outfile: state.fontLoaderPath,
    absWorkingDir: state.absWorkingDir,
    format: 'esm',
    platform: 'node',
    write: true,
    bundle: true,
    minify: false,
    define: {
      __DATA_FONT_FACE__: JSON.stringify(data.fontFace as string),
      __DATA_LOCALES__: JSON.stringify(data.locales),
      __DATA_NO_SCRIPT_STYLE__: JSON.stringify(data.noScriptStyle),
      __DATA_STYLE__: JSON.stringify(data.style),
      __WEB_FONT_LOADER__: JSON.stringify(webFontLoader)
    }
  })
}

void run()
