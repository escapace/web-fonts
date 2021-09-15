import { includes, map, uniq } from 'lodash-es'
import { z } from 'zod'
import { RESOURCE_HINTS, STYLES, WEIGHTS } from './constants'
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
    testString: z.optional(z.string().nonempty()),
    resourceHint: z.optional(
      z
        .string()
        .nonempty()
        .refine((value) => includes(RESOURCE_HINTS, value))
    ),
    unicodeRange: z.optional(
      z
        .string()
        .nonempty()
        .refine((value) => parseUnicodeRange(value).toHexRangeString())
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

export interface DataClass {
  fontFace: string
  style: string | undefined
  noScriptStyle: string | undefined
  resourceHint: string | undefined
}

export interface DataLocales {
  [x: string]: DataClass & {
    fonts: DataFont[]
  }
}

export interface Options {
  cwd?: string
  fontsDir?: string
  fontLoaderPath?: string
  publicDir?: string
}

export interface State {
  absWorkingDir: string
  cacheFonts: Map<string, true>
  cwd: string
  fontLoaderPath: string
  fontsDir: string
  locales: TypeInferLocales
  publicDir: string
  scriptFontStrip: string
  sourceServerFontLoader: string
  sourceWebFontLoader: string
}
