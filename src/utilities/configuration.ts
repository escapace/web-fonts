import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import { filter, find, isString, map } from 'lodash-es'
import { extname } from 'path'
import { createContext, runInNewContext } from 'vm'

export const configuration = async (cwd: string = process.cwd()) => {
  const candidates = await fastGlob(
    ['web-fonts.config.?(m)(j|t)s', 'web-fonts.config.json'],
    {
      absolute: true,
      cwd,
      dot: false
    }
  )

  const configFiles = filter(
    map(['.ts', '.mjs', '.cjs', '.js' /*, '.json' */], (extension) =>
      find(candidates, (value) => extname(value) === extension)
    ),
    isString
  )

  if (configFiles.length === 0) {
    throw new Error(`Could not find a configuration file.`)
  }

  const configFile = configFiles[0]

  const { outputFiles } = await build({
    entryPoints: [configFile],
    bundle: true,
    minify: false,
    loader: {
      '.js': 'js',
      '.mjs': 'js',
      '.cjs': 'js',
      '.ts': 'ts',
      '.tsx': 'tsx'
      // '.json': 'json'
    },
    target: [`node${process.version.slice(1)}`],
    absWorkingDir: cwd,
    write: false,
    platform: 'node',
    format: 'cjs'
  })

  const contents = new TextDecoder('utf-8').decode(outputFiles[0].contents)

  const context = createContext({
    exports: {},
    module: {},
    require,
    console
  })

  runInNewContext(contents, context)

  return context.exports.default ?? context.exports
}
