import fastify from 'fastify'
import fastifyCookie from 'fastify-cookie'
import fastifyEtag from 'fastify-etag'
import fastifySensible from 'fastify-sensible'
import fastifyStatic from 'fastify-static'
import {
  difference,
  get,
  includes,
  isArray,
  isString,
  map,
  uniq
} from 'lodash-es'
import mustache from 'mustache'
import path from 'path'
import fastifyTemplate from 'point-of-view'
import prettier from 'prettier'
import WEB_FONTS from './web-fonts.json'

const CWD = path.resolve(__dirname, '../')

const DEFAULT_LOCALE = 'en'

const PRETTIER_CONFIG = {
  arrowParens: 'always',
  bracketSameLine: true,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  htmlWhitespaceSensitivity: 'css',
  parser: 'html',
  printWidth: 100,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false
} as const

interface L10nCookieContent {
  locale: string
  fontsLoaded: string[]
}

const encode = (value: string) =>
  encodeURIComponent(value).replace(
    /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
    decodeURIComponent
  )

const decode = (value: string) => {
  if (value[0] === '"') {
    value = value.slice(1, -1)
  }

  return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
}

const createL10nCookieContent = (
  cookieString: string | undefined,
  newLocale?: string | null | undefined
): L10nCookieContent => {
  const current: L10nCookieContent = {
    locale: newLocale ?? DEFAULT_LOCALE,
    fontsLoaded: []
  }

  if (isString(cookieString)) {
    try {
      const content = JSON.parse(cookieString)

      if (includes(Object.keys(WEB_FONTS.locales), content.locale)) {
        current.locale = newLocale ?? content.locale
      }

      if (
        isArray(content.fontsLoaded) &&
        difference(
          content.fontsLoaded,
          map(WEB_FONTS.fonts, ({ slug }) => slug)
        ).length === 0
      ) {
        current.fontsLoaded = uniq([
          ...current.fontsLoaded,
          ...content.fontsLoaded
        ])
      }

      return current
    } catch (e) {
      return current
    }
  }

  return current
}

export const createApp = () => {
  process.umask(0o022)
  process.chdir(CWD)

  const app = fastify({ logger: true })

  void app.register(fastifyEtag)
  void app.register(fastifySensible)
  void app.register(fastifyCookie, {
    secret: 'my-secret',
    parseOptions: {
      decode
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  void app.register(fastifyStatic, {
    root: path.join(CWD, 'public')
  })

  void app.register(fastifyTemplate, {
    engine: {
      mustache
    }
  })

  void app.get('/', (request, reply) => {
    const l10nCookieContent = createL10nCookieContent(request.cookies.l10n)

    void reply
      .setCookie('l10n', JSON.stringify(l10nCookieContent), {
        secure: false,
        httpOnly: false,
        signed: false,
        encode
      })
      // .header(
      //   'Cache-Control',
      //   'public, max-age=0, s-maxage=1, stale-while-revalidate=2'
      // )
      .redirect(302, `/${l10nCookieContent.locale}`)
  })

  void app.get<{ Params: { locale: string | null | undefined } }>(
    '/:locale',
    async (request, reply) => {
      if (!includes(Object.keys(WEB_FONTS.locales), request.params.locale)) {
        return reply.status(404).send()
      }

      const l10nCookieContent = createL10nCookieContent(
        request.cookies.l10n,
        request.params.locale
      )

      const html = prettier.format(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (app as any).view(
          `templates/${l10nCookieContent.locale}.mustache`,
          {
            ...get(WEB_FONTS.locales, l10nCookieContent.locale),
            script: [
              '<script>',
              Buffer.from(process.env.SCRIPT as string, 'base64').toString(
                'utf-8'
              ),
              '</script>'
            ].join('\n'),
            fontsLoaded: l10nCookieContent.fontsLoaded.join(' '),
            locale: l10nCookieContent.locale
          },
          {
            partials: {
              header: 'templates/header.mustache',
              footer: 'templates/footer.mustache'
            }
          }
        ),
        PRETTIER_CONFIG
      )

      return (
        reply
          .setCookie('l10n', JSON.stringify(l10nCookieContent), {
            secure: false,
            httpOnly: false,
            signed: false,
            sameSite: 'lax',
            encode
          })
          // .header(
          //   'Cache-Control',
          //   'public, max-age=0, s-maxage=1, stale-while-revalidate=2'
          // )
          .type('text/html')
          .send(html)
      )
    }
  )

  return app
}
