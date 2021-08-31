import { TypeFont, TypeInferFont } from '../schema'
import { createHash } from './create-hash'

export const createSlug = (value: TypeFont | TypeInferFont) =>
  createHash(value.family, value.style, value.weight, value.unicodeRange)
