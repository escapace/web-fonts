import { execa } from 'execa'
import { mkdirp, pathExists, readFile } from 'fs-extra'
import { compact, includes, map } from 'lodash-es'
import path from 'path'
import { SizeFont, State, TypeInferFont } from '../types'
import { size } from './size'

export const writeFont = async (
  slug: string,
  value: TypeInferFont,
  state: State
): Promise<SizeFont[]> => {
  const source = path.resolve(state.cwd, value.source)

  if (!(await pathExists(source))) {
    state.console.exit(`'${value.source}': no such file`)
  }

  if (!includes(['.otf', '.ttf', '.woff'], path.extname(source))) {
    state.console.exit(
      `'${value.source}': not a ttf or cff-flavored opentype (.otf or .ttf) or woff (.woff) font file`
    )
  }

  await mkdirp(state.outputDir)

  return await Promise.all(
    map(value.formats, async (format): Promise<SizeFont> => {
      const outputFile = path.join(state.outputDir, `${slug}.${format}`)

      const fonttools = await execa(
        'pyftsubset',
        compact([
          source,
          value.unicodeRange !== undefined
            ? `--unicodes=${value.unicodeRange}`
            : undefined,
          `--layout-features='*'`,
          `--obfuscate-names`,
          `--output-file=${outputFile}`,
          `--flavor=${format}`,
          format === 'woff' ? '--with-zopfli' : undefined
        ])
      )

      const fontStrip = await execa('python3', [
        state.scriptFontStrip,
        '-f',
        outputFile
      ])

      if (
        !(await pathExists(outputFile)) ||
        fonttools.exitCode !== 0 ||
        fontStrip.exitCode !== 0
      ) {
        state.console.exit(`'${value.source}': fonttools error`)
      }

      const file = path.relative(state.cwd, outputFile)

      state.console.spinner.text = `wrote ${file}`

      return {
        file,
        ...(await size(await readFile(outputFile)))
      }
    })
  )
}
