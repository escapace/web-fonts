import brotliSize from 'brotli-size'
import gzipSize from 'gzip-size'
import { assign } from 'lodash-es'
import { Size } from '../types'

export const size = async (contents: string | Buffer): Promise<Size> =>
  assign(
    {},
    ...(await Promise.all([
      brotliSize(contents).then((brotli) => ({ brotli })),
      gzipSize(contents).then((gzip) => ({ gzip }))
    ]))
  )
