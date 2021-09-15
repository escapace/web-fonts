import execa from 'execa'
import { mkdirp, pathExists } from 'fs-extra'
import { compact, includes, map } from 'lodash-es'
import path from 'path'
import urljoin from 'url-join'
import { State, TypeInferFont } from '../schema'
import { createSlug } from './create-slug'
import { fontFaceSrc } from './font-face-src'

export const createFont = async (value: TypeInferFont, state: State) => {
  const slug = createSlug(value)
  const formats = ['woff2', 'woff'] as const

  const source = path.resolve(state.cwd, value.source)

  if (!(await pathExists(source))) {
    throw new Error(`'${value.source}': no such file`)
  }

  if (!includes(['.woff', '.ttf', '.otf'], path.extname(source))) {
    throw new Error(
      `'${value.source}': not a ttf or cff-flavored opentype (.otf or .ttf) or woff (.woff) font file`
    )
  }

  await mkdirp(state.fontsDir)

  await Promise.all(
    map(formats, async (format) => {
      const outputFile = path.join(state.fontsDir, `${slug}.${format}`)

      // TODO: cache

      const fonttools = await execa(
        'pyftsubset',
        compact([
          source,
          value.unicodeRange !== undefined
            ? `--unicodes=${value.unicodeRange}`
            : undefined,
          `--layout-features='*'`,
          `--obfuscate-names`,
          `--output-file=${outputFile}`,
          `--flavor=${format}`,
          format === 'woff' ? '--with-zopfli' : undefined
        ])
      )

      const fontStrip = await execa(state.scriptFontStrip, ['-f', outputFile])

      if (
        !(await pathExists(outputFile)) ||
        fonttools.exitCode !== 0 ||
        fontStrip.exitCode !== 0
      ) {
        throw new Error(`'${value.source}': fonttools error`)
      }
    })
  )

  const src: string[] = formats.map((format) =>
    urljoin(state.publicDir, `${slug}.${format}`)
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
