/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { CharacterSet } from './character-set'

export const parseUnicodeRange = (input: string) => {
  const ranges = input.split(/\s*,\s*/)
  const result = new CharacterSet()

  for (let i = 0; i < ranges.length; i++) {
    const match = /^(u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?)$/i.exec(
      ranges[i]
    )
    let start = null
    let end = null

    if (match != null) {
      if (match[2].includes('?')) {
        start = parseInt(match[2].replace('?', '0'), 16)
        end = parseInt(match[2].replace('?', 'f'), 16)
      } else {
        start = parseInt(match[2], 16)

        if (match[3]) {
          end = parseInt(match[3], 16)
        } else {
          end = start
        }
      }

      if (start !== end) {
        for (let codePoint = start; codePoint <= end; codePoint++) {
          result.add(codePoint)
        }
      } else {
        result.add(start)
      }
    }
  }

  return result
}
