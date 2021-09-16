import { pick, values } from 'lodash-es'
import { SLUG_PARTS } from '../constants'
import { SlugParts, TypeFont, TypeInferFont } from '../types'
import { createHash } from './create-hash'

export const createSlug = (
  value: Pick<TypeFont | TypeInferFont, SlugParts>
): string => createHash(...values(pick(value, ...SLUG_PARTS)))
