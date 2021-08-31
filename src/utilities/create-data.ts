import CleanCSS from 'clean-css'
import {
  flatMap,
  map,
  mapValues,
  omit,
  pick,
  reduce,
  uniq,
  uniqBy,
  values
} from 'lodash-es'
import { DataFont, DataLocales, SchemaLocales, TypeLocales } from '../schema'
import { createClass } from '../utilities/create-class'

interface Accumulator {
  resourceHint: string[]
  fontFace: string[]
  noScriptStyle: string[]
  style: string[]
}

interface AccumulatorWithFonts extends Accumulator {
  fonts: DataFont[]
}

const accumulate = (
  accumulator: Accumulator,
  value: Accumulator
): Accumulator => {
  const resourceHint: string[] = uniq([
    ...accumulator.resourceHint,
    ...value.resourceHint
  ])

  const fontFace: string[] = uniq([...accumulator.fontFace, ...value.fontFace])

  const noScriptStyle: string[] = uniq([
    ...accumulator.noScriptStyle,
    ...value.noScriptStyle
  ])

  const style: string[] = uniq([...accumulator.style, ...value.style])

  return {
    fontFace,
    noScriptStyle,
    resourceHint,
    style
  }
}

const wrap = (value: string[], key: string): string | undefined => {
  if (value.length === 0) {
    return undefined
  }

  switch (key) {
    case 'style':
      return `<style>${new CleanCSS().minify(value.join('')).styles}</style>`
    case 'fontFace':
      return `<style>${new CleanCSS().minify(value.join('')).styles}</style>`
    case 'noScriptStyle':
      return `<noscript><style>${
        new CleanCSS().minify(value.join('')).styles
      }</style></noscript>`
    case 'resourceHint':
      return value.join('')
    default:
      return undefined
  }
}

export const createData = (_locales: TypeLocales) => {
  const localeAccumulator = mapValues(
    SchemaLocales.parse(_locales),
    (value, locale) =>
      reduce(
        map(value, (value, className) => createClass(locale, className, value)),
        (acc, value) => {
          const values = accumulate(acc, value)

          const fonts = uniqBy(
            [
              ...acc.fonts,
              ...map(value.fonts, (value) =>
                pick(value, ['family', 'slug', 'style', 'testString', 'weight'])
              )
            ],
            (value) => value.slug
          )

          return {
            ...values,
            fonts
          }
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          fontFace: [],
          fonts: [],
          noScriptStyle: [],
          resourceHint: [],
          style: []
        } as AccumulatorWithFonts
      )
  )

  const locales: DataLocales = mapValues(localeAccumulator, (value) => ({
    ...value,
    ...mapValues(
      pick(value, ['style', 'fontFace', 'noScriptStyle', 'resourceHint']),
      (value, key) => wrap(value, key)
    )
  })) as DataLocales

  const fonts: Array<readonly [string, DataFont]> = flatMap(locales, (value) =>
    map(value.fonts, (value) => [value.slug, value] as const)
  )

  const localeIndex: Array<readonly [string, string[]]> = map(
    locales,
    (value, locale) => [locale, map(value.fonts, (value) => value.slug)]
  )

  const { style, fontFace, noScriptStyle } = mapValues(
    omit(
      reduce(
        values(localeAccumulator),
        (accumulator, value) => accumulate(accumulator, value),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          fontFace: [],
          noScriptStyle: [],
          resourceHint: [],
          style: []
        } as Accumulator
      ),
      ['resourceHint']
    ),
    (value, key) => wrap(value, key)
  )

  return { style, fontFace, noScriptStyle, fonts, localeIndex, locales }
}
