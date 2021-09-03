import { build } from 'esbuild'
import path from 'path'
import { TextDecoder } from 'util'
import { configuration } from './utilities/configuration'
import { createData } from './utilities/create-data'

export const run = async () => {
  const cwd = process.cwd()

  const locales = await configuration()

  const data = createData(locales)

  const absWorkingDir = path.resolve(__dirname, '../../')
  const outfile = path.join(cwd, 'ssr.js')

  const { outputFiles: webFontLoaderFiles } = await build({
    entryPoints: [path.join(absWorkingDir, 'src/font-loader/browser.ts')],
    absWorkingDir,
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
    entryPoints: [path.join(absWorkingDir, 'src/font-loader/server.ts')],
    outfile,
    absWorkingDir,
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
