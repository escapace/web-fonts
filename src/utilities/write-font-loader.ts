import { build } from 'esbuild'
import path from 'path'
import { TextDecoder } from 'util'
import { Data, State } from '../types'

export const writeFontLoader = async (
  state: State,
  data: Data
): Promise<{ webFontLoaderContents: string }> => {
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

  const webFontLoaderContents = webFontLoaderFiles
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
      __WEB_FONT_LOADER__: JSON.stringify(webFontLoaderContents)
    }
  })

  state.console.spinner.text = `wrote ${path.relative(
    state.cwd,
    state.fontLoaderPath
  )}`

  return { webFontLoaderContents }
}
