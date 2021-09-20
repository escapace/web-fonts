import cookie from 'js-cookie'
import { webFontLoaderSubscribe } from './web-font-loader'

webFontLoaderSubscribe((fonts) => {
  const l10nCookie = cookie.get('l10n')

  if (l10nCookie === undefined) {
    return
  }

  const l10nCookieContent = JSON.parse(l10nCookie)

  cookie.set(
    'l10n',
    JSON.stringify({
      ...l10nCookieContent,
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      fontsLoaded: [
        ...fonts.map((value) => value.slug),
        ...l10nCookieContent.fontsLoaded
      ]
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort()
    }),
    { secure: false, sameSite: 'lax' }
  )
})

window.webFontLoader(document.documentElement.lang)
