import { includes, map, sortBy, uniq } from 'lodash-es'
import { z } from 'zod'
import { STYLES, WEIGHTS } from './constants'
import { Console } from './utilities/console'
import { createSlug } from './utilities/create-slug'
import { parseUnicodeRange } from './utilities/parse-unicode-range'

export const SchemaFont = z
  .object({
    family: z.string(),
    source: z.string(),
    // TODO: oblique with angle and range
    style: z.optional(
      z
        .string()
        .nonempty()
        .refine((value) => includes(STYLES, value))
    ),
    weight: z.optional(
      z
        .number()
        .int()
        // TODO: range
        .refine((value) => includes(WEIGHTS, value))
      // .transform((value) => weightName(value as ValuesType<typeof WEIGHTS>))
    ),
    display: z.optional(
      z
        .literal('auto')
        .or(z.literal('block'))
        .or(z.literal('swap'))
        .or(z.literal('fallback'))
        .or(z.literal('optional'))
    ),
    formats: z
      .optional(
        z
          .array(z.literal('woff').or(z.literal('woff2')))
          .refine((value) => value.length !== 0)
          .transform((value) =>
            sortBy(uniq(value), (value) => (value === 'woff2' ? 0 : 1))
          )
      )
      .default(['woff', 'woff2']),
    testString: z.optional(z.string().nonempty()),
    resourceHint: z.optional(
      z.literal('preload').or(z.literal('prefetch'))
      // .refine((value) => includes(RESOURCE_HINTS, value))
    ),
    unicodeRange: z.optional(
      z
        .string()
        .nonempty()
        .transform((value) => parseUnicodeRange(value).toHexRangeString())
    )
  })
  .strict()

export const SchemaClass = z.object({
  fonts: z
    .array(SchemaFont)
    // .nonempty()
    // TODO: ensure no duplicates
    .refine((values) => {
      const styles = uniq(map(values, (value) => value.style))
      const weights = uniq(map(values, (value) => value.weight))

      const slugs = uniq(map(values, (value) => createSlug(value)))

      return (
        values.length > 0 &&
        styles.length === 1 &&
        weights.length === 1 &&
        slugs.length === values.length
      )
    }),
  fallback: z
    .optional(z.array(z.string()))
    .transform((value): string[] => (value === undefined ? [] : value))
    .refine((value) => value?.length !== 0)
    .transform((value) => uniq(value))
})

export const SchemaLocale = z.object({}).catchall(SchemaClass)
export const SchemaLocales = z.object({}).catchall(SchemaLocale)

export type TypeLocales = z.input<typeof SchemaLocales>
export type TypeClass = z.input<typeof SchemaClass>
export type TypeFont = z.input<typeof SchemaFont>

export type TypeInferLocales = z.infer<typeof SchemaLocales>
export type TypeInferClass = z.infer<typeof SchemaClass>
export type TypeInferFont = z.infer<typeof SchemaFont>

export interface DataFont {
  style?: string | undefined
  weight?: number | undefined
  testString?: string | undefined
  slug: string
  family: string
}

export interface DataLocales {
  [x: string]: {
    fontFace: string
    style: string | undefined
    noScriptStyle: string | undefined
    resourceHint: string | undefined
    fonts: DataFont[]
  }
}

export interface Options {
  cwd?: string
  outputDir?: string
  loaderPath?: string
  publicPath?: string
  cli?: boolean
}

export interface Size {
  brotli: number
  gzip: number
}

export interface SizeFont extends Size {
  file: string
}

export type RecordSizeFont = Record<string, SizeFont[]>

export interface SizePart extends Size {
  key: 'fontFace' | 'noScriptStyle' | 'resourceHint' | 'style' | 'script'
}

export interface SizeLocale {
  totalFonts: Size
  total: Size
  fonts: SizeFont[]
  totalParts: Size
  parts: SizePart[]
}

export type RecordSizeLocale = Record<string, SizeLocale>

export interface State {
  absWorkingDir: string
  cacheFonts: Map<
    string,
    [TypeInferFont, TypeInferFontExtended, () => Promise<SizeFont[]>]
  >
  cwd: string
  loaderPath: string
  outputDir: string
  locales: TypeInferLocales
  publicPath: string
  scriptFontStrip: string
  sourceServerFontLoader: string
  sourceWebFontLoader: string
  console: Console
}

export interface Data {
  style: string | undefined
  fontFace: string | undefined
  noScriptStyle: string | undefined
  fonts: Array<[string, DataFont]>
  localeIndex: Array<[string, string[]]>
  locales: DataLocales
}

export interface TypeInferFontExtended
  extends Omit<TypeInferFont, 'resourceHint'> {
  slug: string
  fontFace: string
  resourceHint: string[]
}

export type SlugParts = 'family' | 'style' | 'weight' | 'unicodeRange'
export type SlugNonParts = Exclude<keyof (TypeFont | TypeInferFont), SlugParts>
