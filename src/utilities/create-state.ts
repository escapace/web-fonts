import chalk from 'chalk'
import { isArray, isError, isString, map, repeat } from 'lodash-es'
import ora from 'ora'
import path from 'path'
import wrapAnsi from 'wrap-ansi'
import { z } from 'zod'
import { Options, State } from '../types'
import { configuration } from './configuration'

const stringify = (arr: Array<string | number>): string => {
  if (!Array.isArray(arr)) arr = [arr]

  const quote = "'"
  const forceQuote = false

  const regexp = new RegExp('(\\\\|' + quote + ')', 'g')

  return arr
    .map(function (value, key) {
      let property = value.toString()
      if (!forceQuote && /^[A-z_]\w*$/.exec(property) != null) {
        // str with only A-z0-9_ chars will display `foo.bar`
        return key !== 0 ? '.' + property : property
      } else if (!forceQuote && /^\d+$/.exec(property) != null) {
        // str with only numbers will display `foo[0]`
        return '[' + property + ']'
      } else {
        property = property.replace(regexp, '\\$1')
        return '[' + quote + property + quote + ']'
      }
    })
    .join('')
}

const log = {
  error(value: string) {
    const label = 'ERROR'

    const MAX_COLUMNS = 100

    const length = Math.min(
      Math.round((process.stdout.columns / MAX_COLUMNS) * label.length),
      label.length
    )

    const columns = Math.min(100, process.stdout.columns) - length

    const hard = length < Math.round(label.length / 2)

    wrapAnsi(value, columns, { hard })
      .split('\n')
      .map((value, index) =>
        console.error(
          `${index === 0 ? chalk.bgRed(label) : repeat(' ', length)} ${value}`
        )
      )
  }
}

export const createState = async (options: Options): Promise<State> => {
  const isProduction = process.env.NODE_ENV === 'production'

  const spinner = ora({ spinner: 'dots' }).start()

  spinner.text = 'starting up'

  const error = (value: unknown): never => {
    const message = isError(value)
      ? value instanceof z.ZodError
        ? map(
            value.issues,
            ({ code, path, message }) =>
              `${code}: ${stringify(path)} ${message}`
          )
        : value.message
      : isString(value)
      ? value
      : 'Unknown Error'

    if (spinner.isSpinning) {
      spinner.clear()
      spinner.stop()
    }

    if (isProduction) {
      ;[...(isArray(message) ? message : [message])].forEach((value) =>
        log.error(value)
      )

      process.exit(1)
    } else {
      throw isError(value)
        ? value
        : new Error(isArray(message) ? message.join('\n') : message)
    }
  }

  const cwd = options.cwd ?? process.cwd()
  const fontsDir = path.resolve(cwd, options.fontsDir ?? 'public/assets/fonts')
  const publicDir = options.publicDir ?? '/assets/fonts'
  const fontLoaderPath = path.resolve(
    cwd,
    options.fontLoaderPath ?? 'src/font-loader.js'
  )
  const cacheFonts: State['cacheFonts'] = new Map()
  const absWorkingDir = path.resolve(__dirname, '../../')

  const sourceWebFontLoader = path.join(
    absWorkingDir,
    'src/font-loader/browser.ts'
  )
  const sourceServerFontLoader = path.join(
    absWorkingDir,
    'src/font-loader/server.ts'
  )

  const scriptFontStrip = path.join(
    absWorkingDir,
    'src/utilities/font-strip.py'
  )

  const { locales, configFile } = await configuration(cwd, error)

  spinner.text = `read ${configFile}`

  return {
    absWorkingDir,
    cacheFonts,
    cwd,
    error,
    fontLoaderPath,
    fontsDir,
    locales,
    publicDir,
    scriptFontStrip,
    sourceServerFontLoader,
    sourceWebFontLoader,
    spinner
  }
}
