import { reduce } from 'lodash-es'
import { Size } from '../types'

export const sumSize = (...value: Size[]): Size =>
  reduce(
    value,
    (prev, next) => ({
      brotli: prev.brotli + next.brotli,
      gzip: prev.gzip + next.gzip
    }),
    { brotli: 0, gzip: 0 }
  )
