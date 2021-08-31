import { TypeInferFont } from '../schema'
import { createSlug } from './create-slug'
import { fontFaceSrc } from './font-face-src'

export const createFont = (value: TypeInferFont) => {
  const slug = createSlug(value)

  const src: string[] = ['woff2', 'woff'].map((format) =>
    [`/assets/fonts/`, slug, `.${format}`].join('')
  )

  const resourceHint = (() => {
    const lines: string[] = []

    if (value.resourceHint === undefined) {
      return lines
    }

    const url: string | undefined = src.filter((string) =>
      string.endsWith('.woff2')
    )[0]

    if (url !== undefined) {
      lines.push(
        `<link rel="${value.resourceHint}" href="${url}" as="font" type="font/woff2" crossorigin>`
      )
    }

    return lines
  })()

  const fontFace = [
    '@font-face {',
    `  font-family: "${value.family}";`,
    value.weight === undefined ? undefined : `  font-weight: ${value.weight};`,
    value.style === undefined ? undefined : `  font-style: ${value.style};`,
    `  src: ${fontFaceSrc(src)};`,
    value.unicodeRange === undefined
      ? undefined
      : `  unicode-range: ${value.unicodeRange};`,
    '}'
  ]
    .filter((value) => value !== undefined)
    .join('\n')

  return {
    ...value,
    slug,
    fontFace,
    resourceHint
  }
}
