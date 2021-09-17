import chalk from 'chalk'
import { isArray, isError, isString, map, repeat } from 'lodash-es'
import ora, { Ora } from 'ora'
import wrapAnsi from 'wrap-ansi'
import { z } from 'zod'
import { Options } from '../types'
import { fromPath } from './from-path'

export class Console {
  public spinner: Ora
  private readonly options: Options

  constructor(options: Options) {
    this.options = options
    const spinner = ora({ spinner: 'dots' })

    if (options.cli === true) {
      spinner.start()
    }

    spinner.text = 'starting up'

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
