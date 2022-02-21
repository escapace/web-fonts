import { uniq } from 'lodash-es'
import { weightName } from './weight-name'

export const createBlock = (value: {
  family: string[]
  weight?: number
  style?: string
}) =>
  [
    `font-family: ${uniq(value.family).join(', ')};`,
    value.weight === undefined
      ? undefined
      : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `font-weight: '${weightName(value.weight)}';`,
    value.style === undefined ? undefined : `font-style: '${value.style}';`
  ].join(' ')
