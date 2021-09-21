import chalk from 'chalk'
import { isArray, isError, isString, map, repeat } from 'lodash-es'
import ora, { Ora } from 'ora'
import stripAnsi from 'strip-ansi'
import wrapAnsi from 'wrap-ansi'
import { z } from 'zod'
import { Options } from '../types'
import { fromPath } from './from-path'

const wrap = (value: string, label?: string): string => {
  const MAX_COLUMNS = 100

  if (isString(label)) {
    const labelLength = stripAnsi(label).length

    const length = Math.min(
      Math.round((process.stdout.columns / MAX_COLUMNS) * labelLength),
      labelLength
    )

    const columns = Math.min(MAX_COLUMNS, process.stdout.columns) - length

    const hard = length < Math.round(labelLength / 2)

    return wrapAnsi(value, columns, { hard })
      .split('\n')
      .map(
        (value, index) =>
          `${index === 0 ? label : repeat(' ', length)} ${value}`
      )
      .join('\n')
  }

  return wrapAnsi(value, Math.min(MAX_COLUMNS, process.stdout.columns), {
    hard: true
  })
}

export class Console {
  public spinner: Ora
  private readonly options: Options

  constructor(options: Options) {
    this.options = options
    const spinner = ora({ spinner: 'dots' })

    this.spinner = spinner
  }

  exit(value: unknown): never {
    const message = isError(value)
      ? value instanceof z.ZodError
        ? map(
            value.issues,
            ({ code, path, message }) => `${code}: ${fromPath(path)} ${message}`
          )
        : value.message
      : isString(value)
      ? value
      : 'Unknown Error'

    if (this.spinner.isSpinning) {
      this.spinner.clear()
      this.spinner.stop()
    }

    if (this.options.cli === true) {
      ;[...(isArray(message) ? message : [message])].forEach((value) =>
        this.error(value)
      )

      process.exit(1)
    } else {
      throw isError(value)
        ? value
        : new Error(isArray(message) ? message.join('\n') : message)
    }
  }

  log(value: string) {
    console.log(wrap(value))
  }

  warn(value: string) {
    console.log(wrap(value, chalk.bgYellow('WARN')))
  }

  error(value: string) {
    console.error(wrap(value, chalk.bgRed('ERROR')))
  }
}
