import { Options } from './types'
import { createData } from './utilities/create-data'
import { createState } from './utilities/create-state'
import { sizes } from './utilities/sizes'
import { writeFonts } from './utilities/write-fonts'
import { writeJSONFile } from './utilities/write-json-file'
import { writeLoaderFile } from './utilities/write-loader-file'

export const webFonts = async (options: Options = {}) => {
  const state = await createState(options)

  try {
    const data = createData(state)
    const fontSizes = await writeFonts(state)
    const { script } = await writeJSONFile(state, data)
    await writeLoaderFile(data, state)
    const _sizes = await sizes(data, fontSizes, script)

    state.console.spinner.clear()
    state.console.spinner.stop()

    return { sizes, _sizes, data }
  } catch (e) {
    return state.console.exit(e)
  }
}
