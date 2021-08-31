import path from 'path'
import { URL } from 'url'

export const fontFaceSrc = (src: string[]): string =>
  src
    .map((value) => {
      switch (path.extname(new URL(value, 'https://example.org').pathname)) {
        case '.woff2':
          return `url(${value}) format("woff2")`
        case '.woff':
          return `url(${value}) format("woff")`
        case '.ttf':
          return `url(${value}) format("truetype")`
        case '.otf':
          return `url(${value}) format("opentype")`
        case '.eot':
          return `url(${value}) format("embedded-opentype")`
        case '.svg':
          return `url(${value}) format("svg")`
        default:
          return `local(${value})`
      }
    })
    .join(', ')
