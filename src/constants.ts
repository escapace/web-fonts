import { SlugNonParts, SlugParts } from './types'

export const DEFAULT_PUBLIC_PATH = '/assets/fonts'
export const DEFAULT_OUTPUT_DIR = 'public/assets/fonts'
export const DEFAULT_JSON_FILE = 'src/web-fonts.json'
export const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export const STYLES = ['normal', 'italic', 'oblique'] as const
export const HASHS_LENGHT = 7
export const HASH_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const SLUG_PARTS: SlugParts[] = [
  'family',
  'style',
  'weight',
  'unicodeRange'
]

export const SLUG_NON_PARTS: SlugNonParts[] = [
  'source',
  'display',
  'formats',
  'testString',
  'resourceHint'
]
