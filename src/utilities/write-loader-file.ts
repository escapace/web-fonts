import { build } from 'esbuild'
import { writeFile } from 'fs/promises'
import path from 'path'
import { LOADER_DECLARATION } from '../constants'
import { Data, State } from '../types'

export const writeLoaderFile = async (data: Data, state: State) => {
  if (state.loaderFile !== undefined) {
    await build({
      entryPoints: [state.sourceWebFontLoader],
      absWorkingDir: state.absWorkingDir,
      bundle: true,
      minify: false,
      target: ['es2020'],
      sourcemap: 'inline',
      outfile: state.loaderFile,
      write: true,
      format: 'esm',
      define: {
        __DATA_FONTS__: JSON.stringify(data.fontsIndex),
        __DATA_LOCALE_INDEX__: JSON.stringify(data.localeIndex)
      }
    })

    state.console.spinner.text = `wrote ${path.relative(
      state.cwd,
      state.loaderFile
    )}`

    if (state.declaration) {
      const { dir, name } = path.parse(state.loaderFile)

      const declarationFilePath = path.join(dir, `${name}.d.ts`)

      await writeFile(declarationFilePath, LOADER_DECLARATION)

      state.console.spinner.text = `wrote ${path.relative(
        state.cwd,
        declarationFilePath
      )}`
    }
  }
}
