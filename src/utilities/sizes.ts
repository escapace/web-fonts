import {
  assign,
  flatMap,
  fromPairs,
  includes,
  map,
  pickBy,
  values
} from 'lodash-es'
import {
  Data,
  RecordSizeFont,
  RecordSizeLocale,
  Size,
  SizePart
} from '../types'
import { size } from './size'
import { sumSize } from './sum-size'

export const sizes = async (
  data: Data,
  fontSizes: RecordSizeFont,
  webFontLoaderContents: string
): Promise<RecordSizeLocale> => {
  return fromPairs(
    await Promise.all(
      map(data.locales, async (locale, key) => {
        const fonts = flatMap(locale.fonts, ({ slug }) => fontSizes[slug])

        const totalFonts: Size = sumSize(...fonts)

        const recordParts: Record<string, string> = assign(
          { script: webFontLoaderContents },
          pickBy(
            locale,
            (value, key): value is string =>
              value !== undefined &&
              includes(
                ['fontFace', 'noScriptStyle', 'resourceHint', 'style'],
                key
              )
          )
        )

        const totalParts: Size = await size(
          Buffer.concat(
            map(values(recordParts), (string) => Buffer.from(string))
          )
        )

        const parts = (await Promise.all(
          map(recordParts, async (value, key) => ({
            key,
            ...(await size(value))
          }))
        )) as SizePart[]

        const total: Size = sumSize(totalFonts, totalParts)

        return [
          key,
          {
            totalFonts,
            total,
            fonts,
            totalParts,
            parts
          }
        ]
      })
    )
  )
}
