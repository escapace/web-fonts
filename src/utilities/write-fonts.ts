import { assign, map } from 'lodash-es'
import { RecordSizeFont, State } from '../types'

export const writeFonts = async (state: State): Promise<RecordSizeFont> =>
  assign(
    {},
    ...(await Promise.all(
      map(Array.from(state.cacheFonts.entries()), async ([slug, value]) => {
        const sizeFont = await value[2]()

        return {
          [slug]: sizeFont
        }
      })
    ))
  )
