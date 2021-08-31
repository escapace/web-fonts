/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/promise-function-async */

import type { DataLocales } from '../schema'

declare const __WEB_FONT_LOADER__: string
declare const __DATA_LOCALES__: DataLocales
declare const __DATA_FONT_FACE__: string
declare const __DATA_NO_SCRIPT_STYLE__: string | undefined
declare const __DATA_STYLE__: string | undefined

export const locale = (value: string) => {
  const DATA_LOCALES = __DATA_LOCALES__

  if (value === undefined || DATA_LOCALES[value] === undefined) {
    throw new Error('Font Loader: No locale')
  }

  const { fonts, resourceHint, style, noScriptStyle } = DATA_LOCALES[value]

  return { resourceHint, style, noScriptStyle, fonts }
}

export const script = __WEB_FONT_LOADER__
export const fontFace = __DATA_FONT_FACE__
export const noScriptStyle = __DATA_NO_SCRIPT_STYLE__
export const style = __DATA_STYLE__
