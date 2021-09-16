import { createHash as _createHash } from 'crypto'
import Hashids from 'hashids'
import { filter, join } from 'lodash-es'
import { HASHS_LENGHT, HASH_ALPHABET } from '../constants'

export const createHash = (...value: [...Array<string | number | undefined>]) =>
  new Hashids('', HASHS_LENGHT, HASH_ALPHABET)
    .encodeHex(
      _createHash('sha1')
        .update(
          Buffer.from(
            join(
              filter(value, (v) => v !== undefined),
              '#'
            ),
            'utf8'
          ).toString('hex')
        )
        .digest('hex')
    )
    .slice(0, 7)
