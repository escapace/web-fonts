import { build } from 'esbuild'
import path from 'path'
import { TextDecoder } from 'util'
import { TypeLocales } from './schema'
import { createData } from './utilities/create-data'

export const run = async (locales: TypeLocales) => {
  // Look at configs at cwd
  const data = createData(locales)

  const { outputFiles: webFontLoaderFiles } = await build({
    entryPoints: [path.join(__dirname, '../../src/font-loader/browser.ts')],
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
    entryPoints: [path.join(__dirname, '../../src/font-loader/server.ts')],
    outfile: path.join(__dirname, 'ssr.js'),
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
