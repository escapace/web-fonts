import { compact } from 'lodash-es'
import { TypeFont, TypeInferFont } from '../types'

export const describeFont = (value: TypeFont | TypeInferFont): string =>
  compact([
    `family '${value.family}'`,
    value.weight === undefined ? undefined : `weight '${value.weight}'`,
    value.style === undefined ? undefined : `style '${value.style}'`
  ]).join(', ')
