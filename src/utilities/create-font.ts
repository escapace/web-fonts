import { compact, isEqual, pick } from 'lodash-es'
import urljoin from 'url-join'
import { SLUG_NON_PARTS } from '../constants'
import { State, TypeInferFont, TypeInferFontExtended } from '../types'
import { createSlug } from './create-slug'
import { describeFont } from './describe-font'
import { fontFaceSrc } from './font-face-src'
import { writeFont } from './write-font'

const createFontExtended = (
  slug: string,
  value: TypeInferFont,
  state: State
): TypeInferFontExtended => {
  const srcOfFormat = (format: 'woff' | 'woff2') =>
    urljoin(state.publicPath, `${slug}.${format}`)

  const src: string[] = value.formats.map((format) => srcOfFormat(format))

  const resourceHint = compact([
    value.resourceHint === undefined
      ? undefined
      : `<link rel="${value.resourceHint}" href="${srcOfFormat(
          value.formats[0]
        )}" as="font" type="font/${value.formats[0]}" crossorigin>`
  ])

  const fontFace = [
    '@font-face {',
    `  font-family: "${value.family}";`,
    value.weight === undefined ? undefined : `  font-weight: ${value.weight};`,
    value.style === undefined ? undefined : `  font-style: ${value.style};`,
    `  src: ${fontFaceSrc(src)};`,
    value.unicodeRange === undefined
      ? undefined
      : `  unicode-range: ${value.unicodeRange};`,
    value.display === undefined
      ? undefined
      : `  font-display: ${value.display};`,
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

export const createFont = (
  value: TypeInferFont,
  state: State
): TypeInferFontExtended => {
  const slug = createSlug(value)

  if (state.cacheFonts.has(slug)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [cachedValue, cachedExtended] = state.cacheFonts.get(slug)!

    if (
      !isEqual(pick(cachedValue, SLUG_NON_PARTS), pick(value, SLUG_NON_PARTS))
    ) {
      state.console.exit(`conflicting values for ${describeFont(value)}`)
    }

    return cachedExtended
  }

  const extended = createFontExtended(slug, value, state)

  state.cacheFonts.set(slug, [
    value,
    extended,
    async () => await writeFont(slug, value, state)
  ])

  return extended
}
