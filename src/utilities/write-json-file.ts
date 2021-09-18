import { build } from 'esbuild'
import { writeJSON } from 'fs-extra'
import path from 'path'
import { TextDecoder } from 'util'
import { Data, State } from '../types'

export const writeJSONFile = async (
  state: State,
  data: Data
): Promise<{ script: string }> => {
  const script = new TextDecoder('utf-8')
    .decode(
      (
        await build({
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
      ).outputFiles[0].contents
    )
    .replace(/\n$/, '')

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
