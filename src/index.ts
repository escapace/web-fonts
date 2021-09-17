import { Options } from './types'
import { createData } from './utilities/create-data'
import { createState } from './utilities/create-state'
import { sizes } from './utilities/sizes'
import { writeFontLoader } from './utilities/write-font-loader'
import { writeFonts } from './utilities/write-fonts'

export const webFonts = async (options: Options = {}) => {
  const state = await createState(options)

  try {
    const data = createData(state)
    const fontSizes = await writeFonts(state)
    const { webFontLoaderContents } = await writeFontLoader(state, data)
    const _sizes = await sizes(data, fontSizes, webFontLoaderContents)

    state.console.spinner.clear()
    state.console.spinner.stop()

    return { sizes, _sizes, data }
  } catch (e) {
    return state.console.exit(e)
  }
}
