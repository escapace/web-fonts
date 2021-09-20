import { build, OutputFile } from 'esbuild'
import { writeJSON } from 'fs-extra'
import path from 'path'
import { TextDecoder } from 'util'
import { Data, State } from '../types'

const buildToString = (value: { outputFiles: OutputFile[] }): string =>
  new TextDecoder('utf-8')
    .decode(value.outputFiles[0].contents)
    .replace(/\n$/, '')

export const writeJSONFile = async (
  state: State,
  data: Data
): Promise<{ script: string }> => {
  const script = [
    '<script>',
    buildToString(
      await build({
        entryPoints: [state.sourceWebFontLoader],
        absWorkingDir: state.absWorkingDir,
        bundle: true,
        minify: true,
        platform: 'browser',
        write: false,
        format: 'iife',
        define: {
          __DATA_FONTS__: JSON.stringify(data.fontsIndex),
          __DATA_LOCALE_INDEX__: JSON.stringify(data.localeIndex)
        }
      })
    ),
    '</script>'
  ].join('')

  const json = {
    locales: data.locales,
    fonts: data.fonts,
    fontFace: data.fontFace,
    noScriptStyle: data.noScriptStyle,
    script,
    style: data.style
  }

  await writeJSON(state.jsonFile, json, { spaces: '  ' })

  state.console.spinner.text = `wrote ${path.relative(
    state.cwd,
    state.jsonFile
  )}`

  return { script }
}
