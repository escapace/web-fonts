/* eslint-disable @typescript-eslint/require-array-sort-compare */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/promise-function-async */
import FontFaceObserver from 'fontfaceobserver'
import type { DataFont as Font } from '../types'

declare const __DATA_LOCALE_INDEX__: Array<readonly [string, string[]]>
declare const __DATA_FONTS__: Array<readonly [string, Font]>

enum FONT_STATE {
  ALREADY_LOADED,
  LOADED,
  FAILED
}

interface WebFont extends Font {
  promise: Promise<FONT_STATE>
}

type Callback = (webFonts: Font[]) => unknown

declare global {
  interface Window {
    FontFaceObserver: typeof FontFaceObserver
    webFontLoader: (locale: string) => WebFont[]
    webFontLoaderSubscribe: (cb: Callback) => void
  }
}

const LOCALE_INDEX = new Map(__DATA_LOCALE_INDEX__)
const FONTS = new Map(__DATA_FONTS__)

const CACHE_FONT = new Map<Font, WebFont['promise']>()
const LOG = new Set<string>()
const SUBSCRIBERS: Callback[] = []

const getDataFontsLoaded = () =>
  (document.documentElement.getAttribute('data-fonts-loaded')?.split(' ') ?? [])
    .filter((value) => FONTS.has(value))
    .sort()

const updateDataFontsLoaded = (value: string) => {
  const dataFontsLoaded = getDataFontsLoaded()

  if (!dataFontsLoaded.includes(value)) {
    document.documentElement.setAttribute(
      'data-fonts-loaded',
      [...dataFontsLoaded, value]
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort()
        .join(' ')
    )

    return FONT_STATE.LOADED
  }

  return FONT_STATE.ALREADY_LOADED
}

const createPromise = (font: Font): Promise<FONT_STATE> =>
  getDataFontsLoaded().includes(font.slug)
    ? Promise.resolve(FONT_STATE.ALREADY_LOADED)
    : CACHE_FONT.has(font)
    ? CACHE_FONT.get(font)!
    : (() => {
        const promise = new FontFaceObserver(font.family, {
          weight: font.weight,
          style: font.style
        })
          .load(
            typeof font.testString === 'string' ? font.testString : null,
            10000
          )
          .then(() => updateDataFontsLoaded(font.slug))
          .catch(() => {
            CACHE_FONT.delete(font)

            return FONT_STATE.FAILED
          })

        CACHE_FONT.set(font, promise)

        return promise
      })()

const updateSubscribers = (fonts: WebFont[]) =>
  void Promise.all(
    fonts.map((font) =>
      font.promise.then((state) => {
        if (state === FONT_STATE.LOADED && !LOG.has(font.slug)) {
          LOG.add(font.slug)

          return FONTS.get(font.slug)!
        }

        // eslint-disable-next-line no-useless-return
        return
      })
    )
  ).then((_fonts) => {
    const fonts = _fonts.filter((value) => value !== undefined) as Font[]

    if (fonts.length > 0) {
      SUBSCRIBERS.forEach((cb) => cb(fonts))
    }
  })

export const webFontLoaderSubscribe = (cb: Callback) => {
  if (!SUBSCRIBERS.includes(cb)) {
    const loadedFonts = [...LOG].map((slug) => FONTS.get(slug)!)

    if (loadedFonts.length !== 0) {
      cb(loadedFonts)
    }

    SUBSCRIBERS.push(cb)
  }
}

export const webFontLoader = (locale: string) => {
  if (locale === undefined || !LOCALE_INDEX.has(locale)) {
    throw new Error('Font Loader: No locale')
  }

  const fonts = LOCALE_INDEX.get(locale)!
    .map((slug) => FONTS.get(slug)!)
    .map(
      (font): WebFont => ({
        ...font,
        promise: createPromise(font)
      })
    )

  updateSubscribers(fonts)

  return fonts
}

window.FontFaceObserver = FontFaceObserver
window.webFontLoader = webFontLoader
window.webFontLoaderSubscribe = webFontLoaderSubscribe
